"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, Lock, CreditCard, Truck, X, Check, Minus, Plus, ShoppingBag, Wallet, Smartphone, MapPin, Tag, Info } from 'lucide-react';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import { createOrder, createCheckoutSession, createAirwallexCheckout, validatePromoCode } from '@/lib/api';
import { init as initAirwallex } from '@airwallex/components-sdk';
import { isOpeningPeriod, determineBestDiscountHKD } from '@/lib/pricing';

// 計算階梯運費（前端，單位 HKD）
function getShippingFee(method: string, afterDiscountSubtotal: number): number {
  if (method === 'store_pickup') return 0;
  if (afterDiscountSubtotal >= 599) {
    return method === 'sf_locker' ? 0 : 15;
  }
  return method === 'sf_locker' ? 20 : 35;
}

function getShippingLabel(method: string): string {
  switch (method) {
    case 'sf_locker': return '順豐自提櫃';
    case 'sf_delivery': return '順豐到家';
    case 'store_pickup': return '到店取貨';
    default: return '';
  }
}

function getShippingDesc(method: string): string {
  switch (method) {
    case 'sf_locker': return '2-3 個工作日';
    case 'sf_delivery': return '1-2 個工作日';
    case 'store_pickup': return '一周内會另行通知,辦公時間內可取';
    default: return '';
  }
}

const WORKSHOP_ADDRESS = '荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房';

// 結帳狀態的 sessionStorage 鍵（付款取消後返回時還原步驟與表單）
const CHECKOUT_STATE_KEY = 'ochiu_checkout_state';

export default function CheckoutPage() {
  const { items: cartItems, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();
  const { isLoggedIn, isMember } = useAuthStore();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState("sf_locker");
  const [payMethod, setPayMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: '',
    note: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 記錄下單時用的付款方式（用於成功頁面顯示 QR 碼）
  const [placedPayMethod, setPlacedPayMethod] = useState('');

  // ★ 記錄下單時的總金額（clearCart 後 total 會歸零，所以需要快照）
  const [placedTotal, setPlacedTotal] = useState(0);

  // 優惠碼狀態
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  // 法律條款彈窗
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Step 1 表單錯誤提示
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 還原上次未完成的結帳狀態（例如付款取消後返回），讓用戶落回付款選擇步驟
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHECKOUT_STATE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.formData) setFormData(s.formData);
        if (s.shipping) setShipping(s.shipping);
        if (s.payMethod) setPayMethod(s.payMethod);
        if (typeof s.step === 'number') setStep(s.step);
      }
    } catch {
      // 忽略還原失敗
    }
  }, []);

  // 持久化結帳狀態，方便付款取消後返回繼續（付款完成後會清除）
  useEffect(() => {
    if (orderPlaced) return;
    try {
      sessionStorage.setItem(
        CHECKOUT_STATE_KEY,
        JSON.stringify({ formData, shipping, payMethod, step })
      );
    } catch {
      // 忽略保存失敗
    }
  }, [formData, shipping, payMethod, step, orderPlaced]);

  const subtotal = getSubtotal();

  // ========== 全渠道互斥最優折扣預覽（前端） ==========
  const opening = isOpeningPeriod();
  const userIsMember = isLoggedIn && isMember;

  const bestDiscount = determineBestDiscountHKD(
    subtotal,
    userIsMember,
    promoApplied ? promoDiscount : 0,
    promoApplied ? promoLabel : '',
  );

  const appliedDiscountAmount = bestDiscount.discountAmount;
  const appliedDiscountLabel = bestDiscount.label;
  const appliedDiscountChannel = bestDiscount.channel;

  const hasAnyDiscount = opening || userIsMember || (promoApplied && promoDiscount > 0);

  const promoEnteredButNotBest = promoApplied && promoDiscount > 0 &&
    (appliedDiscountChannel === 'opening' || appliedDiscountChannel === 'member');
  // ==============================================================

  const afterDiscount = subtotal - appliedDiscountAmount;
  const shippingCost = getShippingFee(shipping, afterDiscount);
  const total = afterDiscount + shippingCost;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 是否為門市自取
  const isStorePickup = shipping === 'store_pickup';

  // 動態校驗：根據配送方式決定必填字段
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = '請填寫電子郵箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = '請輸入有效的電子郵箱';
    }

    if (!formData.phone.trim()) {
      errors.phone = '請填寫手機號碼';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = '請填寫姓氏';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = '請填寫名字';
    }

    // 非門市自取時，地址字段為必填
    if (!isStorePickup) {
      if (!formData.address.trim()) {
        errors.address = '請填寫詳細地址';
      }
      if (!formData.city.trim()) {
        errors.city = '請填寫城市';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInput = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除對應欄位的錯誤
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleProceedToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const result = await validatePromoCode(promoCode.trim(), subtotal);
      setPromoDiscount(result.discountAmount);
      setPromoLabel(result.label || '優惠碼折扣');
      setPromoApplied(true);
    } catch (err: any) {
      setPromoError(err.message || '優惠碼無效');
      setPromoDiscount(0);
      setPromoLabel('');
      setPromoApplied(false);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoLabel('');
    setPromoApplied(false);
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 門市自取時使用默認地址值
      const shippingAddress = isStorePickup ? WORKSHOP_ADDRESS : formData.address;
      const shippingCity = isStorePickup ? '香港' : formData.city;
      const shippingDistrict = isStorePickup ? '荔枝角' : formData.district;

      const orderData = {
        items: cartItems.map((item) => ({
          productId: String(item.id),
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          hemming: item.hemming || false,
        })),
        email: formData.email,
        phone: formData.phone,
        shippingName: `${formData.lastName}${formData.firstName}`,
        shippingAddress,
        shippingCity,
        shippingDistrict,
        shippingMethod: shipping,
        paymentMethod: payMethod,
        promoCode: promoApplied ? promoCode.trim() : undefined,
        note: formData.note,
      };

      const { order } = await createOrder(orderData);

      // 信用卡 / 支付寶（大陸）/ 微信支付：走 Stripe Checkout
      // 微信為桌面與手機掃碼（client: 'web'），H5 喚醒待日後申請
      // 注意：不在此處清空購物車，付款完成後才在成功頁清除，避免取消付款後購物車已空
      if (payMethod === 'card' || payMethod === 'alipay' || payMethod === 'wechat_pay') {
        const { url } = await createCheckoutSession(order.id);
        if (url) {
          window.location.href = url;
          return;
        }
      }

      // 香港支付寶 (AlipayHK)：走 Airwallex Hosted Payment Page
      // HPP 自動處理桌面掃碼 / 手機喚醒 AlipayHK App，無需我們區分設備
      if (payMethod === 'alipay_hk') {
        const { intentId, clientSecret, currency, env } = await createAirwallexCheckout(order.id);
        if (intentId && clientSecret) {
          const { payments } = await initAirwallex({
            env: (env || 'demo') as 'demo' | 'prod',
            enabledElements: ['payments'],
          });

          if (!payments) {
            setSubmitError('支付組件初始化失敗，請重試');
            return;
          }

          payments.redirectToCheckout({
            env: (env || 'demo') as 'demo' | 'prod',
            mode: 'payment',
            intent_id: intentId,
            client_secret: clientSecret,
            currency: currency || 'HKD',
            country_code: 'HK',
            methods: ['alipayhk'] as any,
            successUrl: `${window.location.origin}/checkout/success?order_id=${order.id}&provider=airwallex`,
          } as any);
          return;
        }
      }

      // FPS / PayMe：也呼叫 createCheckoutSession 以建立 orderEvent 記錄
      if (payMethod === 'fps') {
        try {
          await createCheckoutSession(order.id);
        } catch {
          // 即使 event 記錄失敗也不影響用戶流程
        }
      }

      // FPS / PayMe：訂單已建立並顯示收款碼，清空購物車與已保存的結帳狀態
      setPlacedTotal(total);
      clearCart();
      try {
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
      } catch {
        // 忽略
      }
      setPlacedPayMethod(payMethod);
      setOrderInfo({ orderNumber: order.orderNumber, orderId: order.id });
      setOrderPlaced(true);
    } catch (err: any) {
      setSubmitError(err.message || '提交訂單失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPlaceOrder = agreed && !isSubmitting;

  // ========== 完成訂單頁面（含 FPS/PayMe QR 碼） ==========
  if (orderPlaced) {
    const isFpsPayme = placedPayMethod === 'fps';

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg w-full space-y-6">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium tracking-wider" style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.15em' }}>
            {isFpsPayme ? '訂單已提交，請完成付款' : '感謝您的訂單'}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            訂單編號：<span className="text-black font-medium">{orderInfo?.orderNumber || 'N/A'}</span>
          </p>

          {/* ===== FPS / PayMe QR 碼區域 ===== */}
          {isFpsPayme && (
            <div className="bg-gray-50 p-6 space-y-6 text-left">
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">請掃描以下二維碼完成付款</p>
                <p className="text-xs text-gray-500">付款金額：<span className="font-medium text-black">HK$ {placedTotal.toFixed(2)}</span></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PayMe QR */}
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium tracking-wider">PayMe</p>
                  <div className="relative w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/payme-qr.jpeg"
                      alt="PayMe QR Code"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>

                {/* FPS QR */}
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium tracking-wider">轉數快 (FPS)</p>
                  <div className="relative w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/fps-qr.jpeg"
                      alt="FPS QR Code"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 space-y-2">
                <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  付款須知
                </p>
                <ul className="text-xs text-amber-700 leading-relaxed space-y-1 pl-5">
                  <li>• 請在 <strong>30 分鐘內</strong>完成付款，逾時訂單將自動取消</li>
                  <li>• 轉帳時請在備註欄填寫訂單編號：<strong>{orderInfo?.orderNumber}</strong></li>
                  <li>• 付款完成後請截圖保留，我們確認收款後將安排出貨</li>
                  <li>• 如有問題請透過 IG DM 或 Email 聯繫我們</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===== 非 FPS 的通用訂單摘要 ===== */}
          {!isFpsPayme && (
            <p className="text-sm text-gray-500 leading-relaxed">
              我們已將訂單確認郵件發送至您的郵箱，您可以隨時查看訂單狀態。
            </p>
          )}

          <div className="bg-gray-50 p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">訂單總額</span>
              <span className="font-medium">HK$ {placedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">配送方式</span>
              <span>{getShippingLabel(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">預計送達</span>
              <span>{getShippingDesc(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">付款方式</span>
              <span>{isFpsPayme ? 'PayMe / FPS' : payMethod === 'card' ? '信用卡' : payMethod === 'alipay' ? '支付寶' : payMethod === 'alipay_hk' ? '香港支付寶' : '微信支付'}</span>
            </div>
            {isFpsPayme && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">付款狀態</span>
                <span className="text-amber-600 font-medium">等待付款</span>
              </div>
            )}
            {isStorePickup && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">取貨地址</span>
                <span className="text-right max-w-48 text-xs leading-relaxed">{WORKSHOP_ADDRESS}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/" className="flex-1 py-4 border border-gray-200 text-sm tracking-widest text-center hover:border-black transition-colors">
              繼續購物
            </Link>
            <Link href={`/orders/${orderInfo?.orderId || ''}`} className="flex-1 py-4 bg-black text-white text-sm tracking-widest text-center hover:bg-gray-800 transition-colors">
              查看訂單
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========== 購物車為空 ==========
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto" />
          <h1 className="text-xl font-medium tracking-wider">購物袋是空的</h1>
          <p className="text-sm text-gray-500 leading-relaxed">您的購物袋中還沒有商品，快去挑選心儀的單品吧。</p>
          <Link href="/products" className="inline-block px-10 py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors">
            瀏覽商品
          </Link>
        </div>
      </div>
    );
  }

  // ========== 主結帳頁面 ==========
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="tracking-wider hidden sm:inline">繼續購物</span>
          </Link>
          <h1 className="text-xl tracking-widest font-medium" style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.3em' }}></h1>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            <span className="tracking-wider">安全結帳</span>
          </div>
        </div>
      </header>

      {/* 折扣提示 Banner */}
      {(opening || userIsMember) && (
        <div className="bg-black text-white text-center py-2">
          <p className="text-xs tracking-wider flex items-center justify-center gap-2">
            <Tag className="w-3 h-3" />
            {opening ? '🎉 開業首月限定：全單自動享 9 折優惠' : '👑 會員專屬：全單自動享 9 折優惠'}
            <span className="opacity-60 ml-1">（與優惠碼擇優使用，不疊加）</span>
          </p>
        </div>
      )}

      {/* 進度條：2 步 */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-center gap-0">
          {['配送與資訊', '確認付款'].map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <React.Fragment key={label}>
                {index > 0 && (
                  <div className={`h-px w-16 sm:w-24 transition-colors ${isDone ? 'bg-black' : 'bg-gray-200'}`} />
                )}
                <button
                  type="button"
                  onClick={() => { if (isDone) setStep(stepNum); }}
                  className="flex items-center gap-2 group"
                  disabled={!isDone && !isActive}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isDone ? 'bg-black text-white' : isActive ? 'border-2 border-black text-black' : 'border border-gray-200 text-gray-300'}`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <span className={`text-xs tracking-wider hidden sm:inline transition-colors ${isActive ? 'text-black font-medium' : isDone ? 'text-black' : 'text-gray-300'}`}>
                    {label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 主體內容 */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* 左側：表單區 */}
          <div className="lg:col-span-7 order-2 lg:order-1">

            {/* ================================================================ */}
            {/* Step 1: 配送方式 → 聯絡與地址資訊 */}
            {/* ================================================================ */}
            {step === 1 && (
              <div className="space-y-8">

                {/* ─── 配送方式選擇（最頂部） ─── */}
                <div>
                  <h2 className="text-lg font-medium tracking-wider mb-4">選擇配送方式</h2>
                  <p className="text-xs text-gray-400 tracking-wider mb-6">
                    {afterDiscount >= 599 ? '✓ 已滿 HK$ 599，享有順豐自提櫃免運費優惠' : `再消費 HK$ ${(599 - afterDiscount).toFixed(0)} 即可享順豐自提櫃免運費`}
                  </p>
                  <div className="space-y-3">
                    {/* 順豐自提櫃 */}
                    <button
                      type="button"
                      onClick={() => setShipping('sf_locker')}
                      className={`w-full flex items-center justify-between p-5 border transition-all text-left ${shipping === 'sf_locker' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shipping === 'sf_locker' ? 'border-black' : 'border-gray-300'}`}>
                          {shipping === 'sf_locker' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" />順豐自提櫃</p>
                          <p className="text-xs text-gray-500 mt-1">2-3 個工作日</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{getShippingFee('sf_locker', afterDiscount) === 0 ? '免費' : `HK$ ${getShippingFee('sf_locker', afterDiscount).toFixed(2)}`}</span>
                    </button>

                    {/* 順豐到家 */}
                    <button
                      type="button"
                      onClick={() => setShipping('sf_delivery')}
                      className={`w-full flex items-center justify-between p-5 border transition-all text-left ${shipping === 'sf_delivery' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shipping === 'sf_delivery' ? 'border-black' : 'border-gray-300'}`}>
                          {shipping === 'sf_delivery' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" />順豐到家</p>
                          <p className="text-xs text-gray-500 mt-1">1-2 個工作日</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{getShippingFee('sf_delivery', afterDiscount) === 0 ? '免費' : `HK$ ${getShippingFee('sf_delivery', afterDiscount).toFixed(2)}`}</span>
                    </button>

                    {/* 到店取貨 */}
                    <button
                      type="button"
                      onClick={() => setShipping('store_pickup')}
                      className={`w-full flex items-center justify-between p-5 border transition-all text-left ${shipping === 'store_pickup' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shipping === 'store_pickup' ? 'border-black' : 'border-gray-300'}`}>
                          {shipping === 'store_pickup' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4" />到店取貨</p>
                          <p className="text-xs text-gray-500 mt-1">付款後一星期內會另行通知</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">免費</span>
                    </button>
                  </div>

                  {/* 門市自取：顯示 Workshop 地址 */}
                  {isStorePickup && (
                    <div className="mt-4 p-5 bg-amber-50 border border-amber-100 space-y-2">
                      <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        取貨地點
                      </p>
                      <p className="text-sm text-amber-700 leading-relaxed pl-6">{WORKSHOP_ADDRESS}</p>
                      <p className="text-xs text-amber-600 pl-6 pt-1">開放時間為每月特定日子，建議提前透過 IG DM 或 Email 預約取貨時間</p>
                    </div>
                  )}
                </div>

                {/* ─── 分隔線 ─── */}
                <div className="border-t border-gray-100" />

                {/* ─── 聯絡方式（所有配送方式都必填） ─── */}
                <div>
                  <h2 className="text-lg font-medium tracking-wider mb-6">
                    {isStorePickup ? '取貨人資訊' : '收件人資訊'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 tracking-wider mb-2">電子郵箱 <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInput('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 tracking-wider mb-2">姓 <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInput('lastName', e.target.value)}
                          placeholder="陳"
                          className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                        {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 tracking-wider mb-2">名 <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInput('firstName', e.target.value)}
                          placeholder="小明"
                          className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                        {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 tracking-wider mb-2">手機號碼 <span className="text-red-400">*</span></label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInput('phone', e.target.value)}
                        placeholder="+852 XXXX XXXX"
                        className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* ─── 配送地址（僅順豐配送時顯示） ─── */}
                {!isStorePickup && (
                  <>
                    <div className="border-t border-gray-100" />
                    <div>
                      <h2 className="text-lg font-medium tracking-wider mb-6">配送地址</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500 tracking-wider mb-2">詳細地址 <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInput('address', e.target.value)}
                            placeholder="街道、樓號、室號"
                            className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                          />
                          {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 tracking-wider mb-2">城市 <span className="text-red-400">*</span></label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInput('city', e.target.value)}
                              placeholder="香港"
                              className={`w-full border px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors ${formErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            />
                            {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 tracking-wider mb-2">地區</label>
                            <input
                              type="text"
                              value={formData.district}
                              onChange={(e) => handleInput('district', e.target.value)}
                              placeholder="九龍"
                              className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        {shipping === 'sf_locker' && (
                          <div className="p-4 bg-blue-50 border border-blue-100 text-xs text-blue-700 leading-relaxed flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>順豐自提櫃：請填寫您方便取件的地區地址，我們將為您安排最近的自提點。發貨後會以 SMS 通知具體取件位置及密碼。</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── 備註（通用） ─── */}
                <div>
                  <label className="block text-xs text-gray-500 tracking-wider mb-2">備註（選填）</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => handleInput('note', e.target.value)}
                    placeholder={isStorePickup ? '預約取貨時間、特殊要求...' : '配送備註、特殊要求...'}
                    rows={3}
                    className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* ─── 下一步按鈕 ─── */}
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full py-4 bg-black text-white text-sm tracking-widest font-medium hover:bg-gray-800 transition-colors"
                >
                  繼續前往付款
                </button>
              </div>
            )}

            {/* ================================================================ */}
            {/* Step 2: 確認付款 */}
            {/* ================================================================ */}
            {step === 2 && (
              <div className="space-y-8">

                {/* ─── 訂單資訊摘要卡片 ─── */}
                <div className="bg-gray-50 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500 text-xs tracking-wider">配送方式</p>
                      <p className="font-medium flex items-center gap-2">
                        {isStorePickup ? <MapPin className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                        {getShippingLabel(shipping)}
                      </p>
                      <p className="text-xs text-gray-400">{getShippingDesc(shipping)}</p>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors flex-shrink-0">修改</button>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-500 text-xs tracking-wider">{isStorePickup ? '取貨人' : '收件人'}</p>
                        <p className="font-medium">{formData.lastName}{formData.firstName}</p>
                        <p className="text-gray-500">{formData.phone}</p>
                        <p className="text-gray-500">{formData.email}</p>
                        {!isStorePickup && (
                          <p className="text-gray-500">{formData.address}{formData.district ? `, ${formData.district}` : ''}, {formData.city}</p>
                        )}
                        {isStorePickup && (
                          <p className="text-gray-400 text-xs mt-1">取貨地點：{WORKSHOP_ADDRESS}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors flex-shrink-0">修改</button>
                    </div>
                  </div>
                </div>

                {/* ─── 支付方式 ─── */}
                <div>
                  <h2 className="text-lg font-medium tracking-wider mb-6">支付方式</h2>
                  <div className="space-y-3">
                    {/* 信用卡 */}
                    <button
                      type="button"
                      onClick={() => setPayMethod('card')}
                      className={`w-full p-5 border transition-all text-left ${payMethod === 'card' ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === 'card' ? 'border-black' : 'border-gray-300'}`}>
                          {payMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <CreditCard className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-wider">信用卡 / 扣帳卡</span>
                      </div>
                    </button>

                    {/* 支付寶（大陸） */}
                    <button
                      type="button"
                      onClick={() => setPayMethod('alipay')}
                      className={`w-full p-5 border transition-all text-left ${payMethod === 'alipay' ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === 'alipay' ? 'border-black' : 'border-gray-300'}`}>
                          {payMethod === 'alipay' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-wider">支付寶 (Alipay)</span>
                      </div>
                    </button>

                    {/* 香港支付寶 AlipayHK */}
                    <button
                      type="button"
                      onClick={() => setPayMethod('alipay_hk')}
                      className={`w-full p-5 border transition-all text-left ${payMethod === 'alipay_hk' ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === 'alipay_hk' ? 'border-black' : 'border-gray-300'}`}>
                          {payMethod === 'alipay_hk' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-wider">香港支付寶 (AlipayHK)</span>
                      </div>
                    </button>

                    {/* 微信支付 */}
                    <button
                      type="button"
                      onClick={() => setPayMethod('wechat_pay')}
                      className={`w-full p-5 border transition-all text-left ${payMethod === 'wechat_pay' ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === 'wechat_pay' ? 'border-black' : 'border-gray-300'}`}>
                          {payMethod === 'wechat_pay' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <Smartphone className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-wider">微信支付 (WeChat Pay)</span>
                      </div>
                    </button>

                    {/* FPS/PayMe */}
                    <button
                      type="button"
                      onClick={() => setPayMethod('fps')}
                      className={`w-full p-5 border transition-all text-left ${payMethod === 'fps' ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === 'fps' ? 'border-black' : 'border-gray-300'}`}>
                          {payMethod === 'fps' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                        </div>
                        <span className="text-sm font-medium tracking-wider">PayMe / 轉數快 (FPS)</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ─── 法律條款勾選 ─── */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${agreed ? 'bg-black border-black' : 'border-gray-300'}`}
                  >
                    {agreed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    我已閱讀並同意{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="underline underline-offset-4 text-black hover:text-gray-700 transition-colors"
                    >
                      《服務條款》
                    </button>
                    {' '}與{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="underline underline-offset-4 text-black hover:text-gray-700 transition-colors"
                    >
                      《隱私政策》
                    </button>
                    ，並確認以上資訊無誤。
                  </p>
                </div>

                {/* ─── 錯誤提示 ─── */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider">
                    {submitError}
                  </div>
                )}

                {/* ─── 操作按鈕 ─── */}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="py-4 px-8 border border-gray-200 text-sm tracking-widest hover:border-black transition-colors">返回</button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={!canPlaceOrder}
                    className="flex-1 py-4 bg-black text-white text-sm tracking-widest font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {isSubmitting ? '處理中...' : payMethod === 'fps' ? `提交訂單 HK$ ${total.toFixed(2)}` : `確認支付 HK$ ${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* 右側：訂單摘要（常駐顯示） */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <div className="bg-gray-50 p-6 lg:p-8">
                <h2 className="text-sm font-medium tracking-wider mb-6 flex items-center justify-between">
                  <span>訂單摘要</span>
                  <span className="text-gray-400">{totalItems} 件商品</span>
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    const hemmingCost = item.hemming ? (item.hemmingFee || 15) : 0;
                    const itemTotal = (item.price + hemmingCost) * item.quantity;
                    return (
                      <div key={`${item.id}-${item.color}-${item.size}-${item.hemming ? 'h' : ''}`} className="flex gap-4">
                        <div className="relative w-20 h-24 bg-gray-200 flex-shrink-0 overflow-hidden">
                          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full z-10">{item.quantity}</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-sm font-medium tracking-wide leading-snug">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.color} / {item.size}</p>
                            {item.hemming && <p className="text-xs text-gray-500 mt-0.5">+ 修褲腳</p>}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => { if (item.quantity <= 1) { removeItem(item.id, item.color, item.size); } else { updateQuantity(item.id, item.color, item.size, item.quantity - 1); } }}
                                className="w-6 h-6 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs w-4 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">HK$ {itemTotal.toFixed(2)}</p>
                              <button type="button" onClick={() => removeItem(item.id, item.color, item.size)} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 優惠碼 */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="優惠碼"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); if (promoError) setPromoError(''); }}
                      disabled={promoApplied}
                      className="flex-1 border border-gray-200 bg-white px-4 py-3 text-sm tracking-wider focus:border-black focus:outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {promoApplied ? (
                      <button type="button" onClick={handleRemovePromo} className="px-6 py-3 border border-gray-200 bg-white text-sm tracking-wider hover:border-black transition-colors">取消</button>
                    ) : (
                      <button type="button" onClick={handleApplyPromo} disabled={!promoCode.trim() || promoLoading} className="px-6 py-3 border border-gray-200 bg-white text-sm tracking-wider hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{promoLoading ? '...' : '使用'}</button>
                    )}
                  </div>
                  {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
                  {promoApplied && !promoEnteredButNotBest && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><Check className="w-3 h-3" />優惠碼已套用</p>
                  )}
                  {promoEnteredButNotBest && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      優惠碼有效，但目前{appliedDiscountLabel}更優惠，系統已自動為您選擇最佳折扣
                    </p>
                  )}
                </div>

                {/* 金額明細 */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">商品小計</span>
                    <span>HK$ {subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{appliedDiscountLabel}</span>
                      <span className="text-green-600">- HK$ {appliedDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">配送費用</span>
                    <span>{shippingCost === 0 ? '免費' : `HK$ ${shippingCost.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
                  <span className="text-sm font-medium tracking-wider">合計</span>
                  <span className="text-lg font-medium tracking-wider" style={{ fontFamily: '"Montserrat", serif' }}>HK$ {total.toFixed(2)}</span>
                </div>

                {/* 折扣互斥說明 */}
                {hasAnyDiscount && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>所有優惠（開業折扣、會員折扣、優惠碼）不可疊加使用，系統已自動為您選擇最優惠的方案。</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 隱私政策彈窗 */}
      {/* ================================================================ */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium tracking-wider">隱私政策</h3>
              <button type="button" onClick={() => setShowPrivacyModal(false)} className="p-1 text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-sm text-gray-600 leading-relaxed space-y-4">
              <p><strong>1. 資料收集</strong></p>
              <p>當您在 O&apos;CHIU 網站購物或註冊帳戶時，我們可能收集您的姓名、電子郵箱、聯絡電話、配送地址、訂單記錄及瀏覽資訊。</p>
              <p><strong>2. 資料用途</strong></p>
              <p>我們收集的個人資料僅用於處理訂單、會員管理、發送通知及改善服務。</p>
              <p><strong>3. 資料保護</strong></p>
              <p>我們採用 SSL 加密傳輸及安全支付閘道（Stripe）保護您的資料。不會將個人資料出售予第三方。</p>
              <p><strong>4. 您的權利</strong></p>
              <p>根據香港《個人資料（私隱）條例》，您有權查閱及更正我們持有的個人資料。</p>
              <div className="pt-4 flex gap-3">
                <Link href="/help/privacy" target="_blank" className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors">查看完整政策</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 服務條款彈窗 */}
      {/* ================================================================ */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTermsModal(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium tracking-wider">服務條款</h3>
              <button type="button" onClick={() => setShowTermsModal(false)} className="p-1 text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-sm text-gray-600 leading-relaxed space-y-4">
              <p><strong>1. 總則</strong></p>
              <p>當您使用 O&apos;CHIU 網站時，即表示您同意遵守以下條款。</p>
              <p><strong>2. 商品與定價</strong></p>
              <p>所有價格以港幣（HKD）標示。我們保留調整價格的權利，已確認訂單不受影響。</p>
              <p><strong>3. 訂單與付款</strong></p>
              <p>訂單一經提交並完成付款，恕不接受取消或更改。如庫存不足無法履行訂單，將全額退款。</p>
              <p><strong>4. 退換政策</strong></p>
              <p>本網站僅接受因嚴重製造瑕疵而產生的換貨申請（14天內），不設退貨退款。</p>
              <p><strong>5. 適用法律</strong></p>
              <p>本服務條款受香港特別行政區法律管轄。</p>
              <div className="pt-4 flex gap-3">
                <Link href="/help/terms" target="_blank" className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors">查看完整條款</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}