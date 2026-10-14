// lib/airwallex.ts
// Airwallex 收款核心庫（AlipayHK + WeChat Pay HK）
//
// 採用 REST API 直接調用，避免額外的 server SDK 依賴。
// 鑑權流程：用 client_id + api_key 換 access token（有效約 30 分鐘），
// 之後所有請求帶 Bearer token。此處對 token 做進程內緩存。

// 伺服器端優先讀運行時變量 AIRWALLEX_ENV（非 NEXT_PUBLIC，不會在 build 時被寫死），
// 這樣切換 demo/prod 只需重啟、不必重新 build。回退到 NEXT_PUBLIC 以兼容舊配置。
export function getAirwallexEnv(): 'demo' | 'prod' {
  const env = process.env.AIRWALLEX_ENV || process.env.NEXT_PUBLIC_AIRWALLEX_ENV || 'demo';
  return env === 'prod' ? 'prod' : 'demo';
}

// 依環境切換 API base URL（每次調用時動態判定，避免模組載入時被快取成舊值）
function getApiBase(): string {
  return getAirwallexEnv() === 'prod'
    ? 'https://api.airwallex.com'
    : 'https://api-demo.airwallex.com';
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

// 進程內 token 緩存（Airwallex token 有效期約 30 分鐘，提前 2 分鐘失效以策安全）
const globalForAirwallex = globalThis as unknown as {
  airwallexToken: CachedToken | undefined;
};

async function getAccessToken(): Promise<string> {
  const cached = globalForAirwallex.airwallexToken;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error('缺少 Airwallex API 憑證（AIRWALLEX_CLIENT_ID / AIRWALLEX_API_KEY）');
  }

  const res = await fetch(`${getApiBase()}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-api-key': apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airwallex 鑑權失敗（${res.status}）：${text}`);
  }

  const data = (await res.json()) as { token: string; expires_at?: string };

  // token 有效期約 30 分鐘，緩存 28 分鐘
  globalForAirwallex.airwallexToken = {
    token: data.token,
    expiresAt: Date.now() + 28 * 60 * 1000,
  };

  return data.token;
}

export interface CreatePaymentIntentParams {
  // 金額（單位：分 / cents）。Airwallex 需要主單位，函數內部會自動 /100
  amountCents: number;
  currency: string; // e.g. 'HKD'
  merchantOrderId: string; // 我們的訂單編號
  returnUrl: string; // 付款完成後返回的 URL
  metadata?: Record<string, string>;
}

export interface AirwallexPaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  merchant_order_id?: string;
  metadata?: Record<string, string>;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createAirwallexPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<AirwallexPaymentIntent> {
  const token = await getAccessToken();

  const res = await fetch(`${getApiBase()}/api/v1/pa/payment_intents/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      request_id: generateRequestId(),
      // Airwallex 金額為主單位（小數），訂單存的是分，需 /100
      amount: Number((params.amountCents / 100).toFixed(2)),
      currency: params.currency,
      merchant_order_id: params.merchantOrderId,
      return_url: params.returnUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airwallex 建立 PaymentIntent 失敗（${res.status}）：${text}`);
  }

  return (await res.json()) as AirwallexPaymentIntent;
}

export async function retrieveAirwallexPaymentIntent(
  intentId: string
): Promise<AirwallexPaymentIntent> {
  const token = await getAccessToken();

  const res = await fetch(
    `${getApiBase()}/api/v1/pa/payment_intents/${intentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airwallex 查詢 PaymentIntent 失敗（${res.status}）：${text}`);
  }

  return (await res.json()) as AirwallexPaymentIntent;
}
