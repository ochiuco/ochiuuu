// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const WORKSHOP_ADDRESS = '荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房';
const BRAND_EMAIL = 'ochiuuu@gmail.com';

interface OrderEmailData {
  orderNumber: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict?: string | null;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  items: {
    name: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
}

interface ShippingNotificationEmailData {
  orderNumber: string;
  email: string;
  shippingName: string;
  shippingMethod: string;
  trackingNumber?: string | null;
  items: {
    name: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
}

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'card':
      return '信用卡 / 扣帳卡';
    case 'alipay':
      return '支付寶 (Alipay)';
    case 'alipay_hk':
      return '香港支付寶 (AlipayHK)';
    case 'wechat_pay':
      return '微信支付 (WeChat Pay)';
    case 'fps':
      return 'PayMe / 轉數快 (FPS)';
    default:
      return method;
  }
}

/**
 * 判斷訂單配送方式是否為「門市自取」
 */
function isSelfPickup(shippingMethod: string): boolean {
  if (!shippingMethod) return false;
  const normalized = shippingMethod.toLowerCase().trim();
  return (
    normalized === 'pickup' ||
    normalized === 'self_pickup' ||
    normalized === 'self-pickup' ||
    normalized.includes('自取') ||
    normalized.includes('門市')
  );
}

// ============================================================
// 新增：門市自取 - 綠色主題通知郵件
// ============================================================

/**
 * 發送門市自取備妥通知郵件（綠色主題）
 * @param toEmail - 顧客郵箱
 * @param orderId - 訂單編號（如 OC-20260622-XXXX）
 * @param customerName - 顧客姓名
 */
export async function sendPickupReadyEmail(
  toEmail: string,
  orderId: string,
  customerName: string
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送門市自取通知郵件');
      return;
    }

    const html = buildPickupReadyEmailHtml(orderId, customerName);

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: toEmail,
      subject: `[O'chiu] 您的訂單已備妥，請到門市取貨`,
      html,
    });

    console.log(`📧 [綠色主題] 門市自取備妥通知已發送至 ${toEmail}（訂單 ${orderId}）`);
  } catch (error) {
    console.error('發送門市自取通知郵件失敗：', error);
    throw error;
  }
}

function buildPickupReadyEmailHtml(orderId: string, customerName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #bbf7d0; border-radius: 12px; box-shadow: 0 4px 24px rgba(22, 163, 74, 0.08);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Montserrat', sans-serif; font-size: 24px; letter-spacing: 0.15em; margin: 0; color: #166534;">O'CHIU</h1>
        <p style="color: #16a34a; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">門市自取通知</p>
      </div>

      <!-- Green Success Badge -->
      <div style="background: linear-gradient(135deg, #dcfce7, #f0fdf4); border: 2px solid #22c55e; padding: 24px; margin-bottom: 28px; text-align: center; border-radius: 12px;">
        <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
        <p style="margin: 0; font-size: 20px; color: #15803d; font-weight: 700;">您的訂單已備妥</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #16a34a;">可隨時前來門市提貨</p>
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 28px;">
        <p style="font-size: 15px; color: #333; line-height: 1.8; margin: 0;">
          親愛的 ${customerName || '顧客'}，好消息！
        </p>
        <p style="font-size: 15px; color: #333; line-height: 1.8; margin: 12px 0 0;">
          您的訂單（<strong style="color: #15803d; font-family: monospace; font-size: 14px;">#${orderId}</strong>）商品已經全部準備就緒，您可以隨時前來門市提貨。
        </p>
      </div>

      <!-- Pickup Address Card (強烈加粗醒目) -->
      <div style="background: #14532d; padding: 28px 24px; margin-bottom: 28px; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 12px; color: #86efac; letter-spacing: 0.15em; font-weight: 600; text-transform: uppercase;">📍 取貨地址</p>
        <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 800; line-height: 1.6; letter-spacing: 0.02em;">
          荔枝角青山道688-690號<br/>嘉名工廠大廈B座10樓B室21號房
        </p>
      </div>

      <!-- Reminder -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px 24px; margin-bottom: 28px; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.8;">
          💡 請在到達門市時，向店員出示此郵件或訂單編號。期待您的光臨！
        </p>
      </div>

      <!-- Order Number Display -->
      <div style="background: #f9fafb; border: 1px dashed #d1d5db; padding: 16px 20px; margin-bottom: 24px; text-align: center; border-radius: 8px;">
        <p style="margin: 0; font-size: 11px; color: #6b7280; letter-spacing: 0.1em;">您的訂單編號</p>
        <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; letter-spacing: 0.08em; font-family: 'Courier New', monospace; color: #15803d;">${orderId}</p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">如有任何問題，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">${BRAND_EMAIL}</p>
      </div>

    </div>
    <p style="text-align: center; font-size: 11px; color: #a1a1aa; margin-top: 16px;">© 2026 O'CHIU. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

// ============================================================
// 新增：順豐派送 - 藍色主題通知郵件
// ============================================================

/**
 * 發送順豐發貨通知郵件（藍色主題）
 * @param toEmail - 顧客郵箱
 * @param orderId - 訂單編號
 * @param customerName - 顧客姓名
 * @param trackingNumber - 順豐快遞單號
 */
export async function sendSFShippedEmail(
  toEmail: string,
  orderId: string,
  customerName: string,
  trackingNumber: string
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送順豐發貨通知郵件');
      return;
    }

    const html = buildSFShippedEmailHtml(orderId, customerName, trackingNumber);

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: toEmail,
      subject: `[O'chiu] 您的訂單已由順豐寄出！`,
      html,
    });

    console.log(`📧 [藍色主題] 順豐發貨通知已發送至 ${toEmail}（訂單 ${orderId}，單號：${trackingNumber}）`);
  } catch (error) {
    console.error('發送順豐發貨通知郵件失敗：', error);
    throw error;
  }
}

function buildSFShippedEmailHtml(orderId: string, customerName: string, trackingNumber: string): string {
  const sfTrackingUrl = `https://htm.sf-express.com/hk/tc/dynamic_function/waybill/#waybillNo=${trackingNumber}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #eff6ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #bfdbfe; border-radius: 12px; box-shadow: 0 4px 24px rgba(29, 78, 216, 0.08);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Montserrat', sans-serif; font-size: 24px; letter-spacing: 0.15em; margin: 0; color: #1e3a5f;">O'CHIU</h1>
        <p style="color: #2563eb; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">順豐發貨通知</p>
      </div>

      <!-- Blue Shipped Badge -->
      <div style="background: linear-gradient(135deg, #dbeafe, #eff6ff); border: 2px solid #3b82f6; padding: 24px; margin-bottom: 28px; text-align: center; border-radius: 12px;">
        <div style="font-size: 40px; margin-bottom: 8px;">📦</div>
        <p style="margin: 0; font-size: 20px; color: #1d4ed8; font-weight: 700;">您的包裹已由順豐寄出！</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #3b82f6;">正在為您火速派送中</p>
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 28px;">
        <p style="font-size: 15px; color: #333; line-height: 1.8; margin: 0;">
          親愛的 ${customerName || '顧客'}，
        </p>
        <p style="font-size: 15px; color: #333; line-height: 1.8; margin: 12px 0 0;">
          您的訂單（<strong style="color: #1d4ed8; font-family: monospace; font-size: 14px;">#${orderId}</strong>）已經打包完成並交由順豐速運發出啦！
        </p>
      </div>

      <!-- Tracking Number Card -->
      <div style="background: #1e3a8a; padding: 24px; margin-bottom: 24px; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 12px; color: #93c5fd; letter-spacing: 0.15em; font-weight: 600;">🚚 順豐單號</p>
        <p style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 800; letter-spacing: 0.1em; font-family: 'Courier New', monospace;">
          ${trackingNumber}
        </p>
      </div>

      <!-- CTA Button - 查詢物流進度 -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${sfTrackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 15px; font-weight: 700; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
          查詢最新物流進度 →
        </a>
        <p style="margin: 12px 0 0; font-size: 11px; color: #9ca3af;">點擊上方按鈕即可跳轉至順豐官網查詢物流狀態</p>
      </div>

      <!-- Order Number -->
      <div style="background: #f9fafb; border: 1px dashed #d1d5db; padding: 16px 20px; margin-bottom: 24px; text-align: center; border-radius: 8px;">
        <p style="margin: 0; font-size: 11px; color: #6b7280; letter-spacing: 0.1em;">訂單編號</p>
        <p style="margin: 6px 0 0; font-size: 16px; font-weight: 700; letter-spacing: 0.08em; font-family: 'Courier New', monospace; color: #1d4ed8;">${orderId}</p>
      </div>

      <!-- Tips -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px 20px; margin-bottom: 28px; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.8;">
          💡 順豐快遞員會在派送前致電或發短訊通知，請保持電話暢通。如需改派或自提，可聯繫順豐客服熱線。
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">如有任何問題，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">${BRAND_EMAIL}</p>
      </div>

    </div>
    <p style="text-align: center; font-size: 11px; color: #a1a1aa; margin-top: 16px;">© 2026 O'CHIU. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

// ============================================================
// 以下為原有郵件函數（保持不變）
// ============================================================

/**
 * 構建門市自取通知郵件 HTML（舊版 - 分支 A）
 */
function buildSelfPickupEmailHtml(data: ShippingNotificationEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: 500; font-size: 14px;">${item.name}</span><br/>
          <span style="color: #888; font-size: 12px;">${item.color} / ${item.size}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px;">HK$ ${(item.price / 100).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e5e5;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Montserrat', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0;">O'CHIU</h1>
        <p style="color: #888; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">訂單準備就緒通知</p>
      </div>

      <!-- Ready Badge -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px 24px; margin-bottom: 28px; text-align: center; border-radius: 6px;">
        <p style="margin: 0; font-size: 18px; color: #16a34a; font-weight: 600;">✓ 您的訂單已準備就緒</p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #22c55e;">可隨時來店取貨</p>
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #333; line-height: 1.8; margin: 0;">
          ${data.shippingName ? `${data.shippingName}，您好！` : '您好！'}
        </p>
        <p style="font-size: 14px; color: #333; line-height: 1.8; margin: 12px 0 0;">
          好消息！您的訂單（<strong>#${data.orderNumber}</strong>）已經準備好啦，您現在可以隨時過來門市取貨。
        </p>
      </div>

      <!-- Pickup Address Card -->
      <div style="background: #fffbeb; border: 2px solid #f59e0b; padding: 24px; margin-bottom: 28px; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #92400e; letter-spacing: 0.1em; font-weight: 600;">📍 取貨地址</p>
        <p style="margin: 0; font-size: 16px; color: #000; font-weight: 700; line-height: 1.6;">
          荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房
        </p>
      </div>

      <!-- Reminder -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; margin-bottom: 28px; border-radius: 6px;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
          💡 請在到達門市時向店員出示此郵件或您的訂單編號。期待您的光臨！
        </p>
      </div>

      <!-- Order Number -->
      <div style="background: #f9f9f9; padding: 14px 20px; margin-bottom: 24px; text-align: center; border-radius: 4px;">
        <p style="margin: 0; font-size: 11px; color: #888; letter-spacing: 0.1em;">訂單編號</p>
        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; letter-spacing: 0.05em; font-family: monospace;">${data.orderNumber}</p>
      </div>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 8px 0; text-align: left; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">商品</th>
            <th style="padding: 8px 0; text-align: center; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">數量</th>
            <th style="padding: 8px 0; text-align: right; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">單價</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div style="border-top: 2px solid #000; padding-top: 12px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 14px; font-weight: 600;">合計</td>
            <td style="text-align: right; font-size: 16px; font-weight: 600;">HK$ ${(data.totalAmount / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888;">如有任何問題，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${BRAND_EMAIL}</p>
      </div>

    </div>
    <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 16px;">© 2026 O'CHIU. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * 構建物流發貨通知郵件 HTML（舊版 - 分支 B）
 */
function buildShippingEmailHtml(data: ShippingNotificationEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: 500; font-size: 14px;">${item.name}</span><br/>
          <span style="color: #888; font-size: 12px;">${item.color} / ${item.size}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px;">HK$ ${(item.price / 100).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const trackingHtml = data.trackingNumber
    ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px 24px; margin-bottom: 28px; border-radius: 6px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #1e40af; letter-spacing: 0.1em; font-weight: 600;">🚚 物流追蹤</p>
        <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
          您的包裹已交由物流公司處理。物流單號：<strong style="font-family: monospace; font-size: 15px; color: #1e40af;">${data.trackingNumber}</strong>
        </p>
      </div>
    `
    : `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px 24px; margin-bottom: 28px; border-radius: 6px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #1e40af; letter-spacing: 0.1em; font-weight: 600;">🚚 物流資訊</p>
        <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
          您的包裹已打包發出，正前往您的收件地址，請留意近期物流電話或短訊通知。
        </p>
      </div>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e5e5;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Montserrat', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0;">O'CHIU</h1>
        <p style="color: #888; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">發貨通知</p>
      </div>

      <!-- Shipped Badge -->
      <div style="background: #eff6ff; border: 1px solid #93c5fd; padding: 20px 24px; margin-bottom: 28px; text-align: center; border-radius: 6px;">
        <p style="margin: 0; font-size: 18px; color: #1d4ed8; font-weight: 600;">📦 您的包裹已發出！</p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #3b82f6;">正在為您火速派送中</p>
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #333; line-height: 1.8; margin: 0;">
          ${data.shippingName ? `${data.shippingName}，您好！` : '您好！'}
        </p>
        <p style="font-size: 14px; color: #333; line-height: 1.8; margin: 12px 0 0;">
          您的訂單（<strong>#${data.orderNumber}</strong>）已由我們的倉庫出庫，正在為您派送中。
        </p>
      </div>

      <!-- Tracking Info -->
      ${trackingHtml}

      <!-- Order Number -->
      <div style="background: #f9f9f9; padding: 14px 20px; margin-bottom: 24px; text-align: center; border-radius: 4px;">
        <p style="margin: 0; font-size: 11px; color: #888; letter-spacing: 0.1em;">訂單編號</p>
        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; letter-spacing: 0.05em; font-family: monospace;">${data.orderNumber}</p>
      </div>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 8px 0; text-align: left; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">商品</th>
            <th style="padding: 8px 0; text-align: center; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">數量</th>
            <th style="padding: 8px 0; text-align: right; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">單價</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div style="border-top: 2px solid #000; padding-top: 12px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 14px; font-weight: 600;">合計</td>
            <td style="text-align: right; font-size: 16px; font-weight: 600;">HK$ ${(data.totalAmount / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Workshop Address -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888;">
        <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.1em; color: #666; font-weight: 500;">O'CHIU Workshop</p>
        <p style="margin: 0;">${WORKSHOP_ADDRESS}</p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888;">如有任何問題，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${BRAND_EMAIL}</p>
      </div>

    </div>
    <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 16px;">© 2026 O'CHIU. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * 發送發貨/準備就緒通知郵件（根據配送方式自動分流模板 - 舊版兼容）
 */
export async function sendShippingNotificationEmail(data: ShippingNotificationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送發貨通知郵件');
      return;
    }

    const isPickup = isSelfPickup(data.shippingMethod);

    const subject = isPickup
      ? `[O'chiu] 您的訂單已準備就緒，可隨時來店取貨！`
      : `[O'chiu] 您的包裹已發出！`;

    const html = isPickup
      ? buildSelfPickupEmailHtml(data)
      : buildShippingEmailHtml(data);

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: data.email,
      subject,
      html,
    });

    if (isPickup) {
      console.log(`📧 門市自取通知已發送至 ${data.email}（訂單 ${data.orderNumber}）`);
    } else {
      console.log(`📧 物流發貨通知已發送至 ${data.email}（訂單 ${data.orderNumber}，單號：${data.trackingNumber || '無'}）`);
    }
  } catch (error) {
    console.error('發送發貨通知郵件失敗：', error);
    throw error;
  }
}

function buildReceiptEmailHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: 500;">${item.name}</span><br/>
          <span style="color: #888; font-size: 12px;">${item.color} / ${item.size}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">HK$ ${(item.price / 100).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const discountHtml =
    data.discount > 0
      ? `<tr>
          <td style="padding: 8px 0; color: #888;">優惠碼折扣</td>
          <td style="padding: 8px 0; text-align: right; color: #16a34a;">- HK$ ${(data.discount / 100).toFixed(2)}</td>
        </tr>`
      : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e5e5;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Montserrat', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0;">O'CHIU</h1>
        <p style="color: #888; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">收款憑證 / Payment Receipt</p>
      </div>

      <!-- Order Number -->
      <div style="background: #f9f9f9; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888; letter-spacing: 0.1em;">訂單編號</p>
        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; letter-spacing: 0.05em;">${data.orderNumber}</p>
      </div>

      <!-- Payment Confirmation -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px 20px; margin-bottom: 24px; text-align: center; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #16a34a; font-weight: 500;">✓ 付款成功</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #4ade80;">我們已收到您的付款，訂單正在處理中</p>
      </div>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 8px 0; text-align: left; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">商品</th>
            <th style="padding: 8px 0; text-align: center; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">數量</th>
            <th style="padding: 8px 0; text-align: right; font-weight: 500; font-size: 12px; letter-spacing: 0.05em;">單價</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="width: 100%; font-size: 14px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
        <tr>
          <td style="padding: 8px 0; color: #888;">商品小計</td>
          <td style="padding: 8px 0; text-align: right;">HK$ ${(data.subtotal / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888;">配送費用</td>
          <td style="padding: 8px 0; text-align: right;">${data.shippingFee === 0 ? '免費' : `HK$ ${(data.shippingFee / 100).toFixed(2)}`}</td>
        </tr>
        ${discountHtml}
        <tr style="border-top: 2px solid #000;">
          <td style="padding: 12px 0; font-weight: 600;">合計</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 16px;">HK$ ${(data.totalAmount / 100).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Shipping & Payment Info -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 13px;">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px; color: #888; font-size: 11px; letter-spacing: 0.1em;">配送地址</p>
          <p style="margin: 0;">${data.shippingName}</p>
          <p style="margin: 2px 0 0; color: #555;">${data.shippingAddress}, ${data.shippingDistrict || ''} ${data.shippingCity}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px; color: #888; font-size: 11px; letter-spacing: 0.1em;">付款方式</p>
          <p style="margin: 0;">${getPaymentMethodLabel(data.paymentMethod)}</p>
        </div>
      </div>

      <!-- Workshop Address -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888;">
        <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.1em; color: #666; font-weight: 500;">O'CHIU Workshop</p>
        <p style="margin: 0;">${WORKSHOP_ADDRESS}</p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888;">如有任何問題，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${BRAND_EMAIL}</p>
      </div>

    </div>
    <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 16px;">© 2026 O'CHIU. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

export async function sendPaymentReceiptEmail(data: OrderEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送郵件');
      return;
    }

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: data.email,
      subject: `收款憑證 - ${data.orderNumber} | O'CHIU`,
      html: buildReceiptEmailHtml(data),
    });

    console.log(`📧 收款憑證已發送至 ${data.email}`);
  } catch (error) {
    console.error('發送收款憑證郵件失敗：', error);
  }
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送郵件');
      return;
    }

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: data.email,
      subject: `訂單確認 - ${data.orderNumber} | O'CHIU`,
      html: buildReceiptEmailHtml(data),
    });

    console.log(`📧 確認郵件已發送至 ${data.email}`);
  } catch (error) {
    console.error('發送郵件失敗：', error);
  }
}

interface VerificationEmailData {
  email: string;
  token: string;
  name?: string;
}

export async function sendVerificationEmail(data: VerificationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送驗證郵件');
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e5e5; text-align: center;">
      <h1 style="font-family: 'Montserrat', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0;">O'CHIU</h1>
      <p style="color: #888; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">郵箱驗證</p>
      
      <div style="margin: 32px 0;">
        <p style="font-size: 14px; color: #333; margin-bottom: 16px;">
          ${data.name ? `Hi ${data.name}，` : '您好，'}歡迎加入 O'CHIU！
        </p>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
          請使用以下驗證碼完成郵箱驗證：
        </p>
        <div style="background: #f9f9f9; padding: 20px; display: inline-block; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #000; font-family: monospace;">${data.token}</span>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 16px;">
          驗證碼將於 15 分鐘後過期
        </p>
      </div>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 12px; color: #888;">如果這不是您的操作，請忽略此郵件。</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${BRAND_EMAIL}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: data.email,
      subject: `郵箱驗證碼 - O'CHIU`,
      html,
    });

    console.log(`📧 驗證郵件已發送至 ${data.email}`);
  } catch (error) {
    console.error('發送驗證郵件失敗：', error);
  }
}

interface PasswordResetEmailData {
  email: string;
  token: string;
  name?: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY 未設置，跳過發送重置密碼郵件');
      return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e5e5; text-align: center;">
      <h1 style="font-family: 'Montserrat', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0;">O'CHIU</h1>
      <p style="color: #888; font-size: 13px; margin-top: 8px; letter-spacing: 0.05em;">重置密碼</p>
      
      <div style="margin: 32px 0;">
        <p style="font-size: 14px; color: #333; margin-bottom: 16px;">
          ${data.name ? `Hi ${data.name}，` : '您好，'}
        </p>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
          我們收到了您的密碼重置請求。請使用以下驗證碼重置密碼：
        </p>
        <div style="background: #f9f9f9; padding: 20px; display: inline-block; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #000; font-family: monospace;">${data.token}</span>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 16px;">
          驗證碼將於 15 分鐘後過期
        </p>
      </div>

      <div style="margin-top: 24px; padding: 16px 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px;">
        <p style="margin: 0; font-size: 12px; color: #92400e;">
          ⚠️ 如果這不是您的操作，請立即忽略此郵件。您的密碼不會被更改。
        </p>
      </div>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 12px; color: #888;">如需幫助，請聯繫我們</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${BRAND_EMAIL}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: "O'CHIU <noreply@ochiu.co>",
      to: data.email,
      subject: `重置密碼驗證碼 - O'CHIU`,
      html,
    });

    console.log(`📧 重置密碼郵件已發送至 ${data.email}`);
  } catch (error) {
    console.error('發送重置密碼郵件失敗：', error);
  }
}