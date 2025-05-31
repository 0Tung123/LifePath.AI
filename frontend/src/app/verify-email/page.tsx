"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Nếu có token, thực hiện xác minh email
    if (token) {
      const verifyEmail = async () => {
        try {
          setLoading(true);

          await axios.post("/api/auth/verify-email", { token });

          setVerified(true);
          setLoading(false);
        } catch (err: any) {
          console.error("Verification error:", err);
          setError(
            err.response?.data?.message ||
              "Xác minh email thất bại. Vui lòng thử lại."
          );
          setLoading(false);
        }
      };

      verifyEmail();
    }
  }, [token]);

  const handleResendVerification = async () => {
    if (!email) {
      setError("Không có địa chỉ email để gửi lại xác minh");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/auth/resend-verification", { email });

      router.push("/resend-verification/success");
    } catch (err: any) {
      console.error("Resend verification error:", err);
      setError(
        err.response?.data?.message ||
          "Gửi lại email xác minh thất bại. Vui lòng thử lại."
      );
      setLoading(false);
    }
  };

  // Nếu đang xác minh token
  if (token && loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang xác minh email...
          </div>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Nếu xác minh thành công
  if (verified) {
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">Email đã được xác minh!</h1>
          <p className="text-gray-400 mb-8">
            Tài khoản của bạn đã được kích hoạt thành công. Bây giờ bạn có thể
            đăng nhập và bắt đầu cuộc phiêu lưu.
          </p>

          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-block font-bold"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // Trang chờ xác minh email
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
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

        <h1 className="text-3xl font-bold mb-4">Xác minh email của bạn</h1>
        <p className="text-gray-400 mb-6">
          Chúng tôi đã gửi một email xác minh đến{" "}
          <span className="text-white font-medium">
            {email || "địa chỉ email của bạn"}
          </span>
          . Vui lòng kiểm tra hộp thư đến và nhấp vào liên kết xác minh.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${
              loading
                ? "bg-blue-700 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang gửi...
              </div>
            ) : (
              "Gửi lại email xác minh"
            )}
          </button>

          <Link
            href="/login"
            className="block w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-bold"
          >
            Quay lại đăng nhập
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
