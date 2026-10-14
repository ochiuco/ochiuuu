'use client';

import { useEffect } from 'react';

function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-light text-gray-200">Oops</h1>
      <h2 className="mt-4 text-xl font-light text-gray-900">
        發生了一些問題
      </h2>
      <p className="mt-3 text-gray-500 max-w-md text-sm">
        頁面載入時出現錯誤，請稍後再試。
      </p>
      <button
        onClick={reset}
        className="mt-8 px-8 py-3 bg-black text-white text-sm tracking-wider hover:bg-gray-800 transition-colors cursor-pointer"
      >
        重新嘗試
      </button>
    </div>
  );
}

export default Error;