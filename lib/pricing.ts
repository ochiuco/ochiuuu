// lib/pricing.ts

/**
 * O'CHIU 定價引擎（終極版 — 全渠道折扣絕對互斥 + 最優自動判定）
 *
 * 核心規則：
 * 1. 開業首月：全站全單 9 折（10% off）
 * 2. 非開業期：永久會員全單 9 折（10% off）
 * 3. 優惠碼：O'CHIU 10% / ARIA|CHLOE|ICY|CRYSTAL|LEO 20% / BEE 30% / ochiulover 階梯減免
 * 4.【絕對互斥原則】上述三種渠道 **絕不疊加**，僅取最優單一折扣
 * 5. 所有金額單位：分（cents），1 HKD = 100 分
 */

// ============================================================
// 開業促銷期判定
// ============================================================

const DEFAULT_OPENING_PROMO_END = '2026-07-19T23:59:59+08:00';

export function getOpeningPromoEnd(): Date {
  const envDate = process.env.NEXT_PUBLIC_OPENING_PROMO_END || DEFAULT_OPENING_PROMO_END;
  return new Date(envDate);
}

export function isOpeningPeriod(): boolean {
  const now = new Date();
  const end = getOpeningPromoEnd();
  return now <= end;
}

// ============================================================
// 單渠道折扣計算
// ============================================================

export function getMemberDiscountRate(isMember: boolean): number {
  if (isOpeningPeriod()) return 0.9;
  if (isMember) return 0.9;
  return 1.0;
}

export function calculateMemberDiscountAmount(subtotalCents: number, isMember: boolean): number {
  const rate = getMemberDiscountRate(isMember);
  if (rate >= 1.0) return 0;
  return Math.floor(subtotalCents * (1 - rate));
}

export function getMemberDiscountLabel(isMember: boolean): string {
  if (isOpeningPeriod()) return '開業優惠 (全單9折)';
  if (isMember) return '會員優惠 (全單9折)';
  return '';
}

// ============================================================
// 會員晉升門檻
// ============================================================

export const MEMBER_THRESHOLD_SINGLE_ORDER = 80000;   // 單筆 >= HK$ 800
export const MEMBER_THRESHOLD_CUMULATIVE = 150000;    // 累計 >= HK$ 1500

// ============================================================
// 內建優惠碼引擎 (Built-in Promo Code Engine)
// ============================================================

export interface BuiltInPromoCode {
  code: string;
  discountType: 'PERCENTAGE' | 'TIERED_FIXED'; // 👈 新增 TIERED_FIXED 類型
  discountValue: number;
  minOrderAmount: null;
  label: string;
}

const BUILT_IN_PROMO_CODES: BuiltInPromoCode[] = [
  { code: "O'CHIU", discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: null, label: '全單9折優惠' },
  { code: "ARIA", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "CHLOE", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "ICY", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "CRYSTAL", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "LEO", discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: null, label: '全單8折優惠' },
  { code: "BEE", discountType: 'PERCENTAGE', discountValue: 30, minOrderAmount: null, label: '全單7折優惠' },
  // 👇 新增 ochiulover 階梯優惠
  { code: "ochiulover", discountType: 'TIERED_FIXED', discountValue: 0, minOrderAmount: null, label: 'Seasonal Drop Sale' },
];

function normalizePromoCodeInput(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'");
}

export function findBuiltInPromoCode(inputCode: string): BuiltInPromoCode | null {
  const normalized = normalizePromoCodeInput(inputCode);
  return BUILT_IN_PROMO_CODES.find(p => p.code === normalized) || null;
}

/**
 * 計算內建優惠碼折扣金額（單位：分）
 */
export function calculateBuiltInPromoDiscount(subtotalCents: number, promo: BuiltInPromoCode): number {
  // 👇 處理 ochiulover的階梯邏輯（單位：分）
  if (promo.discountType === 'TIERED_FIXED') {
    if (promo.code === 'ochiulover') {
      if (subtotalCents >= 120000) return 15000; // 滿 1200 減 150
      if (subtotalCents >= 80000) return 8000;   // 滿 800 減 80
      if (subtotalCents >= 50000) return 4000;   // 滿 500 減 40
      return 0;
    }
    return 0;
  }

  // 原有的百分比計算
  const discount = Math.floor((subtotalCents * promo.discountValue) / 100);
  return Math.min(discount, subtotalCents);
}

/**
 * 計算內建優惠碼折扣金額（單位：港幣）
 */
export function calculateBuiltInPromoDiscountHKD(subtotalHKD: number, promo: BuiltInPromoCode): number {
  // 👇 處理 ochiulover 的階梯邏輯（單位：港幣）
  if (promo.discountType === 'TIERED_FIXED') {
    if (promo.code === 'ochiulover') {
      if (subtotalHKD >= 1200) return 150;
      if (subtotalHKD >= 800) return 80;
      if (subtotalHKD >= 500) return 40;
      return 0;
    }
    return 0;
  }

  // 原有的百分比計算
  const discount = Math.floor((subtotalHKD * promo.discountValue) / 100 * 100) / 100;
  return Math.min(discount, subtotalHKD);
}

// ============================================================
// 全渠道折扣絕對互斥 + 最優自動判定算法
// ============================================================

export type DiscountChannel = 'opening' | 'member' | 'promo_builtin' | 'promo_db' | 'none';

export interface DiscountOption {
  channel: DiscountChannel;
  discountAmount: number;
  label: string;
  promoCodeId: string | null;
}

export interface BestDiscountResult {
  channel: DiscountChannel;
  discountAmount: number;
  label: string;
  promoCodeId: string | null;
  memberDiscountForDB: number;
  promoDiscountForDB: number;
  allOptions: DiscountOption[];
}

export function determineBestDiscount(
  subtotalCents: number,
  isMember: boolean,
  promoDiscountCents: number = 0,
  promoChannel: 'promo_builtin' | 'promo_db' = 'promo_builtin',
  promoLabel: string = '',
  promoCodeId: string | null = null,
): BestDiscountResult {
  const allOptions: DiscountOption[] = [];

  if (isOpeningPeriod()) {
    const amount = Math.floor(subtotalCents * 0.1);
    allOptions.push({
      channel: 'opening',
      discountAmount: amount,
      label: '開業優惠 (全單9折)',
      promoCodeId: null,
    });
  }

  if (isMember && !isOpeningPeriod()) {
    const amount = Math.floor(subtotalCents * 0.1);
    allOptions.push({
      channel: 'member',
      discountAmount: amount,
      label: '會員優惠 (全單9折)',
      promoCodeId: null,
    });
  }

  if (promoDiscountCents > 0) {
    allOptions.push({
      channel: promoChannel,
      discountAmount: promoDiscountCents,
      label: promoLabel || '優惠碼折扣',
      promoCodeId: promoCodeId,
    });
  }

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

  allOptions.sort((a, b) => b.discountAmount - a.discountAmount);
  const best = allOptions[0];

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

export function determineBestDiscountHKD(
  subtotalHKD: number,
  isMember: boolean,
  promoDiscountHKD: number = 0,
  promoLabel: string = '',
): { discountAmount: number; label: string; channel: DiscountChannel } {
  const options: { channel: DiscountChannel; amount: number; label: string }[] = [];

  if (isOpeningPeriod()) {
    const amount = Math.floor(subtotalHKD * 10) / 100;
    options.push({ channel: 'opening', amount, label: '開業優惠 (全單9折)' });
  }

  if (isMember && !isOpeningPeriod()) {
    const amount = Math.floor(subtotalHKD * 10) / 100;
    options.push({ channel: 'member', amount, label: '會員優惠 (全單9折)' });
  }

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