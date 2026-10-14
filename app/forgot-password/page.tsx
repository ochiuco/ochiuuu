"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '發送失敗');
        return;
      }

      setSent(true);
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-3">
            郵件已發送
          </h1>
          <p className="text-sm text-gray-500 tracking-wider mb-2">
            重置密碼的驗證碼已發送至
          </p>
          <p className="text-sm text-black font-medium tracking-wider mb-6">
            {email}
          </p>
          <p className="text-xs text-gray-400 tracking-wider mb-8">
            請查看您的收件箱（包括垃圾郵件資料夾），驗證碼將於 15 分鐘後過期。
          </p>
          <button
            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
            className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors"
          >
            輸入驗證碼
          </button>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-4 text-sm text-gray-500 tracking-wider hover:text-black transition-colors"
          >
            使用其他郵箱
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <KeyRound className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            忘記密碼
          </h1>
          <p className="text-sm text-gray-400 tracking-wider">
            輸入您的註冊郵箱，我們將發送重置密碼的驗證碼
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '發送中...' : '發送驗證碼'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm text-gray-500 tracking-wider hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登入
          </Link>
        </div>
      </div>
    </main>
  );
}