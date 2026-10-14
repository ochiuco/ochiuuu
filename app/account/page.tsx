"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Award,
  Star,
  Gift,
  ChevronRight,
  Package,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Heart,
  X,
} from 'lucide-react';
import { fetchAccount, upsertAccount, loginAccount } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AccountPage() {
  const router = useRouter();
  const { email: storedEmail, isLoggedIn, login, logout, hydrate, fetchWishlist, wishlistIds } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoggedIn && storedEmail && !searched) {
      setEmail(storedEmail);
      setLoading(true);
      fetchAccount(storedEmail)
        .then((data) => {
          setUser(data);
          setEditName(data.name || '');
          setEditPhone(data.phone || '');
          setSearched(true);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn, storedEmail, searched, logout]);

  // 當用戶已登入且資料加載完成時，獲取收藏列表
  useEffect(() => {
    if (searched && storedEmail) {
      setWishlistLoading(true);
      fetch(`/api/wishlist?email=${encodeURIComponent(storedEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWishlistItems(data);
          }
        })
        .catch(() => {})
        .finally(() => setWishlistLoading(false));

      fetchWishlist();
    }
  }, [searched, storedEmail, fetchWishlist]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const result = await loginAccount({ email: email.trim(), password });
      setUser(result.user);
      setEditName(result.user.name || '');
      setEditPhone(result.user.phone || '');
      login(email.trim());
      setSearched(true);
    } catch (err: any) {
      if (err.requiresVerification) {
        router.push(`/verify?email=${encodeURIComponent(err.email || email.trim())}`);
        return;
      }
      setError(err.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setSearched(false);
    setEmail('');
    setPassword('');
    setError('');
    setWishlistItems([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await upsertAccount({
        email: email.trim(),
        name: editName,
        phone: editPhone,
      });
      setUser(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail, productId }),
      });
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
      useAuthStore.getState().removeWishlistId(productId);
    } catch {
      // silently fail
    }
  };

  if (loading && !searched) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // 登入表單
  if (!searched) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            我的帳戶
          </h1>
          <p className="text-sm text-gray-400 tracking-wider mb-8">
            輸入您的電子郵箱和密碼登入會員帳戶
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-11 pr-4 py-4 border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密碼"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-11 pr-11 py-4 border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-black transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-gray-400 tracking-wider hover:text-black transition-colors"
              >
                忘記密碼？
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider text-left">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400 tracking-wider">
              還沒有帳戶？{' '}
              <Link
                href="/register"
                className="text-black underline underline-offset-4 hover:text-gray-700 transition-colors font-medium"
              >
                註冊帳戶
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center py-20">
          <p className="text-sm text-gray-400 tracking-wider">帳戶載入失敗</p>
          <button
            onClick={handleLogout}
            className="mt-4 text-sm text-gray-500 underline underline-offset-4 hover:text-black transition-colors"
          >
            重新登入
          </button>
        </div>
      </main>
    );
  }

  // 二元會員狀態判定
  const isMember = user.isMember === true;
  const memberLabel = isMember ? '永久會員' : '普通會員';
  const memberIcon = isMember ? '👑' : '👤';

  return (
    <main className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* 會員卡片 */}
        <div className="bg-black text-white rounded-xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-lg tracking-[0.3em] font-medium"
                style={{ fontFamily: '"Montserrat", serif' }}
              >
                O&apos;CHIU
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{memberIcon}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-white/60 tracking-wider mb-1">會員</p>
              <p className="text-xl font-medium tracking-wider">
                {user.name || user.email}
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-white/60 tracking-wider mb-1">身份</p>
                <p className="text-sm font-medium tracking-wider">{memberLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 tracking-wider mb-1">積分</p>
                <p className="text-2xl font-medium tracking-wider">{user.points}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 會員權益提示 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-medium tracking-widest">會員權益</h2>
          </div>
          {isMember ? (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-2xl">👑</span>
              <div>
                <p className="text-sm font-medium text-yellow-800 tracking-wider">永久會員</p>
                <p className="text-xs text-yellow-600 tracking-wider mt-0.5">
                  尊享全單 9 折優惠（非開業期間適用）
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 tracking-wider mb-2">
                成為永久會員，享全單 9 折優惠
              </p>
              <div className="text-xs text-gray-400 tracking-wider space-y-1">
                <p>• 單筆訂單滿 HK$ 800 即自動升級</p>
                <p>• 或累計消費滿 HK$ 1,500 自動升級</p>
              </div>
            </div>
          )}
        </div>

        {/* 我的收藏 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-medium tracking-widest">我的收藏</h2>
            </div>
            {wishlistItems.length > 0 && (
              <span className="text-xs text-gray-400 tracking-wider">
                {wishlistItems.length} 件商品
              </span>
            )}
          </div>

          {wishlistLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : wishlistItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistItems.map((item) => {
                const product = item.product;
                if (!product || !product.isActive) return null;
                return (
                  <div key={item.id} className="group relative">
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm mb-2">
                        <Image
                          src={product.images[0] || '/images/testing1.jpeg'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.tag && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[9px] tracking-widest">
                            {product.tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs tracking-wider text-gray-800 line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs font-medium tracking-wider" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                        HK$ {product.price / 100}
                        {product.originalPrice && (
                          <span className="text-gray-400 line-through ml-2">
                            HK$ {product.originalPrice / 100}
                          </span>
                        )}
                      </p>
                    </Link>
                    {/* 移除收藏按鈕 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveWishlist(product.id)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="取消收藏"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 tracking-wider">暫無收藏商品</p>
              <Link
                href="/products"
                className="inline-block mt-3 text-xs text-black underline underline-offset-4 tracking-wider hover:text-gray-600 transition-colors"
              >
                去逛逛
              </Link>
            </div>
          )}
        </div>

        {/* 個人資料 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-medium tracking-widest">個人資料</h2>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors tracking-wider"
              >
                編輯
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-gray-500 tracking-wider hover:text-black transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs text-black font-medium tracking-wider disabled:opacity-50"
                >
                  {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 tracking-wider">電子郵箱</p>
                  <p className="text-sm tracking-wider">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 tracking-wider">姓名</p>
                  <p className="text-sm tracking-wider">{user.name || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 tracking-wider">手機號碼</p>
                  <p className="text-sm tracking-wider">{user.phone || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 tracking-wider">註冊日期</p>
                  <p className="text-sm tracking-wider">
                    {new Date(user.memberSince).toLocaleDateString('zh-HK')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 tracking-wider mb-2">姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                  placeholder="您的姓名"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 tracking-wider mb-2">手機號碼</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                  placeholder="+852 XXXX XXXX"
                />
              </div>
            </div>
          )}
        </div>

        {/* 積分記錄 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-medium tracking-widest">積分記錄</h2>
          </div>

          {user.pointsHistory && user.pointsHistory.length > 0 ? (
            <div className="space-y-3">
              {user.pointsHistory.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm tracking-wider">{record.reason}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(record.createdAt).toLocaleDateString('zh-HK')}
                    </p>
                  </div>
                  <span className={`text-sm font-medium tracking-wider ${record.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {record.points > 0 ? '+' : ''}{record.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 tracking-wider text-center py-6">
              暫無積分記錄
            </p>
          )}
        </div>

        {/* 最近訂單 */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-medium tracking-widest">最近訂單</h2>
            </div>
            <Link
              href="/orders"
              className="text-xs text-gray-500 tracking-wider hover:text-black transition-colors flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {user.orders && user.orders.length > 0 ? (
            <div className="space-y-3">
              {user.orders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="text-sm font-mono tracking-wider">{order.orderNumber}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('zh-HK')}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-medium tracking-wider">
                      HK$ {(order.totalAmount / 100).toFixed(2)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 tracking-wider text-center py-6">
              暫無訂單記錄
            </p>
          )}
        </div>
      </div>
    </main>
  );
}