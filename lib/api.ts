// lib/api.ts
const BASE = '';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ============ Products ============

export async function fetchProducts(params?: {
  category?: string;
  tag?: string;
  sort?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${BASE}/api/products?${query.toString()}`);
  const data = await handleResponse(res);
  return data.products;
}

export async function fetchProduct(id: string) {
  const res = await fetch(`${BASE}/api/products/${id}`);
  const data = await handleResponse(res);
  return data.product;
}

export async function checkStock(productId: string, color: string, size: string) {
  const query = new URLSearchParams({ color, size });
  const res = await fetch(`${BASE}/api/products/${productId}/stock?${query.toString()}`);
  return handleResponse(res);
}

// ============ Orders ============

export async function createOrder(orderData: any) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
}

export async function fetchOrder(id: string) {
  const res = await fetch(`${BASE}/api/orders/${id}`);
  const data = await handleResponse(res);
  return data.order;
}

export async function fetchOrdersByEmail(email: string) {
  const res = await fetch(`${BASE}/api/orders?email=${encodeURIComponent(email)}`);
  const data = await handleResponse(res);
  return data.orders;
}

// ============ Checkout ============

export async function createCheckoutSession(orderId: string) {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  return handleResponse(res);
}

// Airwallex 收款（AlipayHK + WeChat Pay HK）
export async function createAirwallexCheckout(orderId: string) {
  const res = await fetch(`${BASE}/api/checkout/airwallex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  return handleResponse(res);
}

// ============ Promo ============

export async function validatePromoCode(code: string, subtotal: number) {
  const res = await fetch(`${BASE}/api/promo/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  return handleResponse(res);
}

// ============ Account ============

export async function fetchAccount(email: string) {
  const res = await fetch(`${BASE}/api/account?email=${encodeURIComponent(email)}`);
  const data = await handleResponse(res);
  return data.user;
}

export async function upsertAccount(data: { email: string; name?: string; phone?: string }) {
  const res = await fetch(`${BASE}/api/account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse(res);
  return result.user;
}

// ============ Auth ============

export async function registerAccount(data: { email: string; password: string; name?: string }) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function loginAccount(data: { email: string; password: string }) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    // 創建帶有額外屬性的錯誤對象，用於未驗證跳轉
    const error: any = new Error(result.error || '登入失敗');
    error.requiresVerification = result.requiresVerification || false;
    error.email = result.email || data.email;
    throw error;
  }

  return res.json();
}

export async function verifyEmail(data: { email: string; token: string }) {
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function resendVerification(email: string) {
  const res = await fetch(`${BASE}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function resetPassword(data: { email: string; token: string; newPassword: string }) {
  const res = await fetch(`${BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ============ Admin ============

export async function fetchAdminStats() {
  const res = await fetch(`${BASE}/api/admin/stats`);
  return handleResponse(res);
}