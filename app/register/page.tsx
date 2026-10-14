"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { registerAccount } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInput = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少 6 位');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);
    try {
      await registerAccount({
        email: formData.email,
        password: formData.password,
      });
      // 註冊成功後跳轉到郵箱驗證頁（不再直接登入）
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            註冊帳戶
          </h1>
          <p className="text-sm text-gray-400 tracking-wider">
            創建您的 O'CHIU 會員帳戶
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-500 tracking-wider mb-2">電子郵箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInput('email', e.target.value)}
                className="w-full pl-11 pr-4 py-4 border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 tracking-wider mb-2">密碼</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="至少 6 位字符"
                value={formData.password}
                onChange={(e) => handleInput('password', e.target.value)}
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
          </div>

          <div>
            <label className="block text-xs text-gray-500 tracking-wider mb-2">確認密碼</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="再次輸入密碼"
                value={formData.confirmPassword}
                onChange={(e) => handleInput('confirmPassword', e.target.value)}
                className="w-full pl-11 pr-11 py-4 border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-black transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '註冊中...' : '創建帳戶'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 tracking-wider">
            已有帳戶？{' '}
            <Link
              href="/account"
              className="text-black underline underline-offset-4 hover:text-gray-700 transition-colors"
            >
              登入
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}