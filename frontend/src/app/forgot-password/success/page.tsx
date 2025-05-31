"use client";

import Link from "next/link";

export default function ForgotPasswordSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Kiểm tra email của bạn</h1>
        <p className="text-gray-400 mb-8">
          Chúng tôi đã gửi một email chứa liên kết đặt lại mật khẩu. Vui lòng
          kiểm tra hộp thư đến và nhấp vào liên kết để tiếp tục.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-bold"
          >
            Quay lại đăng nhập
          </Link>

          <Link
            href="/"
            className="block w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-bold"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>
            Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc
            thử lại với một địa chỉ email khác.
          </p>
        </div>
      </div>
    </div>
  );
}
