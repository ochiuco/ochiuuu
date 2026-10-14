// lib/pricing.ts

/**
 * O'CHIU 定價引擎（終極版 — 全渠道折扣絕對互斥 + 最優自動判定）
 *
 * 核心規則：
 * 1. 開業首月：全站全單 9 折（10% off）
 * 2. 非開業期：永久會員全單 9 折（10% off）
 * 3. 優惠碼：O'CHIU 10% / ARIA|CHLOE|ICY|CRYSTAL|LEO 20% / BEE 30%
 * 4.【絕對互斥原則】上述三種渠道 **絕不疊加**，僅取最優單一折扣
 * 5. 所有金額單位：分（cents），1 HKD = 100 分
 */

// ============================================================
// 開業促銷期判定
// ============================================================

// 開業促銷截止日期（含當天）。可透過環境變量覆寫。
// 格式：ISO 日期字符串，如 '2026-07-19T23:59:59+08:00'
const DEFAULT_OPENING_PROMO_END = '2026-07-19T23:59:59+08:00';

/**
 * 取得開業促銷截止時間
 */
export function getOpeningPromoEnd(): Date {
  const envDate = process.env.NEXT_PUBLIC_OPENING_PROMO_END || DEFAULT_OPENING_PROMO_END;
  return new Date(envDate);
}

/**
 * 判斷當前是否處於開業促銷期間
 */
export function isOpeningPeriod(): boolean {
  const now = new Date();
  const end = getOpeningPromoEnd();
  return now <= end;
}

// ============================================================
// 單渠道折扣計算（獨立計算，供最優判定使用）
// ============================================================

/**
 * 計算會員/開業折扣率
 *
 * @param isMember - 用戶是否為永久會員
 * @returns 折扣率（0.9 表示打 9 折，1.0 表示不打折）
 *
 * 邏輯：
 * - 開業期間 → 0.9（所有人）
 * - 非開業期 + 會員 → 0.9
 * - 非開業期 + 非會員 → 1.0
 */
export function getMemberDiscountRate(isMember: boolean): number {
  if (isOpeningPeriod()) {
    return 0.9;
  }
  if (isMember) {
    return 0.9;
  }
  return 1.0;
}

/**
 * 計算會員/開業折扣金額（單位：分）
 *
 * @param subtotalCents - 商品小計（分）
 * @param isMember - 是否永久會員
 * @returns 折扣金額（分）。例如 subtotal=10000, rate=0.9 → discount=1000
 */
export function calculateMemberDiscountAmount(subtotalCents: number, isMember: boolean): number {
  const rate = getMemberDiscountRate(isMember);
  if (rate >= 1.0) return 0;
  // 折扣金額 = 小計 × (1 - 折扣率)，向下取整
  return Math.floor(subtotalCents * (1 - rate));
}

/**
 * 取得折扣描述標籤
 */
export function getMemberDiscountLabel(isMember: boolean): string {
  if (isOpeningPeriod()) {
    return '開業優惠 (全單9折)';
  }
  if (isMember) {
    return '會員優惠 (全單9折)';
  }
  return '';
}

// ============================================================
// 會員晉升門檻
// ============================================================

/**
 * 會員晉升門檻（單位：分）
 */
export const MEMBER_THRESHOLD_SINGLE_ORDER = 80000;   // 單筆 >= HK$ 800
export const MEMBER_THRESHOLD_CUMULATIVE = 150000;    // 累計 >= HK$ 1500

// ============================================================
// 內建優惠碼引擎 (Built-in Promo Code Engine)
// ============================================================

/**
 * 內建優惠碼定義
 *
 * 核心規則：
 * - "O'CHIU" → 全單 10% off（9折）
 * - "ARIA" | "CHLOE" | "ICY" | "CRYSTAL" | "LEO" → 全單 20% off（8折）
 * - "BEE" → 全單 30% off（7折）
 * - 所有內建碼：無任何最低消費門檻
 */
export interface BuiltInPromoCode {
  code: string;
  discountType: 'PERCENTAGE';
  discountValue: number; // 百分比數字，如 10 表示 10% off
  minOrderAmount: null;  // 永遠無門檻
  label: string;         // 顯示用標籤
}

const BUILT_IN_PROMO_CODES: BuiltInPromoCode[] = [
  { code: "O'CHIU", discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: null, label: '全單9折優惠' },
  { code: "ARIA", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "CHLOE", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "ICY", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "CRYSTAL", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "LEO", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "BEE", discountType: 'PERCENTAGE', discountValue: 30, minOrderAmount: null, label: '全單7折優惠' },
];

/**
 * 正規化優惠碼輸入（統一大寫、統一引號字符）
 */
function normalizePromoCodeInput(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'"); // 統一各種引號為標準 ASCII 撇號
}

/**
 * 查找內建優惠碼
 *
 * @param inputCode - 用戶輸入的優惠碼（任何大小寫）
 * @returns 匹配到的內建優惠碼定義，或 null（表示不是內建碼，應走 DB 查詢）
 */
export function findBuiltInPromoCode(inputCode: string): BuiltInPromoCode | null {
  const normalized = normalizePromoCodeInput(inputCode);
  return BUILT_IN_PROMO_CODES.find(p => p.code === normalized) || null;
}

/**
 * 計算內建優惠碼折扣金額（單位：分）
 *
 * @param subtotalCents - 折前金額（單位：分）— 必須為原始小計，非折後金額
 * @param promo - 內建優惠碼定義
 * @returns 折扣金額（單位：分），向下取整
 */
export function calculateBuiltInPromoDiscount(subtotalCents: number, promo: BuiltInPromoCode): number {
  const discount = Math.floor((subtotalCents * promo.discountValue) / 100);
  return Math.min(discount, subtotalCents); // 確保折扣不超過金額本身
}

/**
 * 計算內建優惠碼折扣金額（港幣，非分）
 *
 * @param subtotalHKD - 折前金額（單位：港幣）— 必須為原始小計，非折後金額
 * @param promo - 內建優惠碼定義
 * @returns 折扣金額（單位：港幣）
 */
export function calculateBuiltInPromoDiscountHKD(subtotalHKD: number, promo: BuiltInPromoCode): number {
  const discount = Math.floor((subtotalHKD * promo.discountValue) / 100 * 100) / 100;
  return Math.min(discount, subtotalHKD);
}

// ============================================================
// 全渠道折扣絕對互斥 + 最優自動判定算法
// (All-Channel Mutual Exclusion & Best Value Algorithm)
// ============================================================

/**
 * 折扣渠道類型
 */
export type DiscountChannel = 'opening' | 'member' | 'promo_builtin' | 'promo_db' | 'none';

/**
 * 折扣計算結果
 */
export interface DiscountOption {
  channel: DiscountChannel;
  discountAmount: number;  // 折扣金額（分）
  label: string;           // 前端顯示標籤
  promoCodeId: string | null; // 數據庫優惠碼 ID（僅 promo_db 類型有值）
}

/**
 * 最優折扣判定結果
 */
export interface BestDiscountResult {
  /** 被採納的折扣渠道 */
  channel: DiscountChannel;
  /** 折扣金額（分） */
  discountAmount: number;
  /** 前端顯示標籤 */
  label: string;
  /** 數據庫優惠碼 ID（僅 promo_db 時有值） */
  promoCodeId: string | null;
  /** 存入 order.memberDiscount 的金額（分） */
  memberDiscountForDB: number;
  /** 存入 order.discount 的金額（分） */
  promoDiscountForDB: number;
  /** 所有參與比較的折扣選項（用於日誌/審計） */
  allOptions: DiscountOption[];
}

/**
 * 全渠道最優折扣自動判定（後端權威計算 — 核心算法）
 *
 * 此函數獨立計算所有符合條件的折扣渠道對應的折扣金額，
 * 然後自動選擇金額最大（對顧客最有利）的單一折扣。
 *
 * 【絕對互斥保證】返回的結果中，永遠只有一個折扣生效。
 *
 * @param subtotalCents - 商品原始小計（分），不含任何折扣
 * @param isMember - 用戶是否為永久會員
 * @param promoDiscountCents - 優惠碼折扣金額（分），由調用方事先計算好；若無優惠碼則傳 0
 * @param promoChannel - 優惠碼渠道類型（'promo_builtin' | 'promo_db'）
 * @param promoLabel - 優惠碼標籤
 * @param promoCodeId - 數據庫優惠碼 ID（僅 DB 碼有值）
 * @returns BestDiscountResult
 */
export function determineBestDiscount(
  subtotalCents: number,
  isMember: boolean,
  promoDiscountCents: number = 0,
  promoChannel: 'promo_builtin' | 'promo_db' = 'promo_builtin',
  promoLabel: string = '',
  promoCodeId: string | null = null,
): BestDiscountResult {
  const allOptions: DiscountOption[] = [];

  // ---- 渠道 1：開業首月優惠（10% off） ----
  if (isOpeningPeriod()) {
    const amount = Math.floor(subtotalCents * 0.1);
    allOptions.push({
      channel: 'opening',
      discountAmount: amount,
      label: '開業優惠 (全單9折)',
      promoCodeId: null,
    });
  }

  // ---- 渠道 2：永久會員權益（10% off） ----
  // 注意：開業期間所有人已享 9 折，會員 9 折與開業 9 折是同一折扣率，
  // 但仍獨立列出，確保非開業期會員可享折扣
  if (isMember && !isOpeningPeriod()) {
    const amount = Math.floor(subtotalCents * 0.1);
    allOptions.push({
      channel: 'member',
      discountAmount: amount,
      label: '會員優惠 (全單9折)',
      promoCodeId: null,
    });
  }

  // ---- 渠道 3：優惠碼（由調用方傳入已計算好的金額） ----
  if (promoDiscountCents > 0) {
    allOptions.push({
      channel: promoChannel,
      discountAmount: promoDiscountCents,
      label: promoLabel || '優惠碼折扣',
      promoCodeId: promoCodeId,
    });
  }

  // ---- 無任何折扣可用 ----
  if (allOptions.length === 0) {
    return {
      channel: 'none',
      discountAmount: 0,
      label: '',
      promoCodeId: null,
      memberDiscountForDB: 0,
      promoDiscountForDB: 0,
      allOptions: [],
    };
  }

  // ---- 自動選擇最大折扣金額（對顧客最有利） ----
  allOptions.sort((a, b) => b.discountAmount - a.discountAmount);
  const best = allOptions[0];

  // ---- 映射到數據庫欄位 ----
  // order.memberDiscount：開業或會員渠道時寫入
  // order.discount：優惠碼渠道時寫入
  let memberDiscountForDB = 0;
  let promoDiscountForDB = 0;

  if (best.channel === 'opening' || best.channel === 'member') {
    memberDiscountForDB = best.discountAmount;
    promoDiscountForDB = 0;
  } else if (best.channel === 'promo_builtin' || best.channel === 'promo_db') {
    memberDiscountForDB = 0;
    promoDiscountForDB = best.discountAmount;
  }

  return {
    channel: best.channel,
    discountAmount: best.discountAmount,
    label: best.label,
    promoCodeId: best.promoCodeId,
    memberDiscountForDB,
    promoDiscountForDB,
    allOptions,
  };
}

// ============================================================
// 前端預覽用：計算最優折扣（港幣版本）
// ============================================================

/**
 * 前端用最優折扣預覽計算（港幣）
 *
 * 邏輯與後端 determineBestDiscount 完全一致，
 * 但單位為港幣（用於前端展示），後端以分為權威單位。
 *
 * @param subtotalHKD - 商品原始小計（港幣）
 * @param isMember - 用戶是否會員
 * @param promoDiscountHKD - 優惠碼折扣（港幣），0 表示無優惠碼
 * @param promoLabel - 優惠碼標籤
 * @returns { discountAmount, label, channel }
 */
export function determineBestDiscountHKD(
  subtotalHKD: number,
  isMember: boolean,
  promoDiscountHKD: number = 0,
  promoLabel: string = '',
): { discountAmount: number; label: string; channel: DiscountChannel } {
  const options: { channel: DiscountChannel; amount: number; label: string }[] = [];

  // 開業優惠
  if (isOpeningPeriod()) {
    const amount = Math.floor(subtotalHKD * 10) / 100; // 10% off, 精確到分
    options.push({ channel: 'opening', amount, label: '開業優惠 (全單9折)' });
  }

  // 會員優惠（非開業期）
  if (isMember && !isOpeningPeriod()) {
    const amount = Math.floor(subtotalHKD * 10) / 100;
    options.push({ channel: 'member', amount, label: '會員優惠 (全單9折)' });
  }

  // 優惠碼
  if (promoDiscountHKD > 0) {
    options.push({ channel: 'promo_builtin', amount: promoDiscountHKD, label: promoLabel || '優惠碼折扣' });
  }

  if (options.length === 0) {
    return { discountAmount: 0, label: '', channel: 'none' };
  }

  options.sort((a, b) => b.amount - a.amount);
  const best = options[0];
  return { discountAmount: best.amount, label: best.label, channel: best.channel };
}