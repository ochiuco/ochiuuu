"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [step, setStep] = useState<'otp' | 'newPassword'>('otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        setStep('newPassword');
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      setStep('newPassword');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('密碼長度至少 6 位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: otp.join(''),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '重置失敗');
        if (data.error?.includes('驗證碼') || data.error?.includes('過期')) {
          setStep('otp');
          setOtp(['', '', '', '', '', '']);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/account'), 2000);
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 tracking-wider">無效的重置連結</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm text-black underline underline-offset-4">
            重新發送驗證碼
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-3">
            密碼重置成功
          </h1>
          <p className="text-sm text-gray-500 tracking-wider mb-6">
            您的密碼已成功更新，正在跳轉到登入頁面...
          </p>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  // Step 1: 輸入 OTP
  if (step === 'otp') {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            輸入驗證碼
          </h1>
          <p className="text-sm text-gray-400 tracking-wider mb-2">
            已發送至
          </p>
          <p className="text-sm text-black font-medium tracking-wider mb-8">
            {email}
          </p>

          <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 border-2 border-gray-200 text-center text-xl font-mono font-bold tracking-wider focus:outline-none focus:border-black transition-colors rounded-lg"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider mb-4">
              {error}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-gray-500 tracking-wider hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              重新發送驗證碼
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Step 2: 設置新密碼
  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <Lock className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            設置新密碼
          </h1>
          <p className="text-sm text-gray-400 tracking-wider">
            請輸入您的新密碼
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-500 tracking-wider mb-2">新密碼</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="至少 6 位字符"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
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
            <label className="block text-xs text-gray-500 tracking-wider mb-2">確認新密碼</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="再次輸入新密碼"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
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
            <div className="p-3 bg-red-50 border border-red-100 text-sm text-red-600 tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '重置中...' : '重置密碼'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setStep('otp'); setOtp(['', '', '', '', '', '']); setError(''); }}
            className="text-sm text-gray-500 tracking-wider hover:text-black transition-colors"
          >
            重新輸入驗證碼
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}