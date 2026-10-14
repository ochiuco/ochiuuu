// app/not-found.tsx
import Link from 'next/link';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[120px] md:text-[180px] font-light leading-none tracking-tighter text-gray-200">
        404
      </h1>
      <h2 className="mt-4 text-2xl md:text-3xl font-light text-gray-900">
        頁面不存在
      </h2>
      <p className="mt-3 text-gray-500 max-w-md">
        你訪問的頁面可能已被移除、名稱已更改，或暫時無法使用。
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-black text-white text-sm tracking-wider hover:bg-gray-800 transition-colors"
        >
          返回首頁
        </Link>
        <Link
          href="/products"
          className="px-8 py-3 border border-black text-black text-sm tracking-wider hover:bg-black hover:text-white transition-colors"
        >
          瀏覽商品
        </Link>
      </div>
    </div>
  );
}

export default NotFound;