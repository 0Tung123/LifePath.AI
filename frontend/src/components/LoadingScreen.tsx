"use client";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "Đang tải...",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "min-h-[200px]"
      } bg-gray-900 text-white flex items-center justify-center`}
    >
      <div className="text-center">
        <div className="animate-pulse text-2xl font-bold mb-4">{message}</div>
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
