function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 旋转动画 */}
        <div className="w-8 h-8 border border-gray-300 border-t-black rounded-full animate-spin" />
        <p className="text-sm text-gray-500 tracking-wider">載入中...</p>
      </div>
    </div>
  );
}

export default Loading;