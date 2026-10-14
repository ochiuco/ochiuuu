"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const login = useAuthStore((state) => state.login);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 倒計時
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 自動聚焦第一個輸入框
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // 自動跳到下一格
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 自動提交（全部填完）
    if (value && index === 5) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '驗證失敗');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      setSuccess('驗證成功！正在跳轉...');
      login(email);
      setTimeout(() => router.push('/account'), 1500);
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '重新發送失敗');
        return;
      }
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('網路錯誤');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 tracking-wider">無效的驗證連結</p>
          <button
            onClick={() => router.push('/register')}
            className="mt-4 text-sm text-black underline underline-offset-4"
          >
            返回註冊
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-md mx-auto px-6 text-center">
        <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-6" />
        <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
          郵箱驗證
        </h1>
        <p className="text-sm text-gray-400 tracking-wider mb-2">
          驗證碼已發送至
        </p>
        <p className="text-sm text-black font-medium tracking-wider mb-8">
          {email}
        </p>

        {/* OTP 輸入框 */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 border-2 border-gray-200 text-center text-xl font-mono font-bold tracking-wider focus:outline-none focus:border-black transition-colors rounded-lg"
              disabled={loading}
            />
          ))}
        </div>

        {/* 狀態訊息 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-100 text-sm text-green-600 tracking-wider mb-4">
            {success}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 tracking-wider">驗證中...</span>
          </div>
        )}

        {/* 重新發送 */}
        <div className="mt-6">
          <p className="text-xs text-gray-400 tracking-wider mb-3">
            沒有收到驗證碼？
          </p>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="inline-flex items-center gap-2 text-sm text-black tracking-wider hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {countdown > 0 ? `${countdown}s 後可重新發送` : resending ? '發送中...' : '重新發送驗證碼'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 tracking-wider">
            驗證碼將於 15 分鐘後過期
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}