"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    api
      .get("/auth/status")
      .then((res) => {
        if (res.data.isAuthenticated) {
          setIsLoggedIn(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth Status Error:", err);
        setLoading(false);
      });

    // Lấy thông điệp từ backend
    api
      .get("/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70 z-10"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-40"></div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold">Thế Giới Phiêu Lưu</div>

            <div className="flex space-x-4">
              {!loading &&
                (isLoggedIn ? (
                  <>
                    <Link
                      href="/game"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Vào Game
                    </Link>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                      Trang Cá Nhân
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Đăng Nhập
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                      Đăng Ký
                    </Link>
                  </>
                ))}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">
            Bước Vào Thế Giới Phiêu Lưu Kỳ Diệu
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Khám phá những cuộc phiêu lưu đầy hấp dẫn, nơi mỗi lựa chọn của bạn
            sẽ định hình nên câu chuyện độc đáo của riêng mình.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!loading &&
              (isLoggedIn ? (
                <button
                  onClick={() => router.push("/game")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
                >
                  Bắt Đầu Phiêu Lưu
                </button>
              ) : (
                <button
                  onClick={() => router.push("/register")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
                >
                  Tham Gia Ngay
                </button>
              ))}

            <button
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg text-lg font-bold transition-all"
            >
              Tìm Hiểu Thêm
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Tính Năng Nổi Bật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 rounded-xl p-6 transform transition-all hover:scale-105">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">
                Câu Chuyện Sống Động
              </h3>
              <p className="text-gray-300 text-center">
                Đắm chìm trong những câu chuyện phong phú với nhiều thể loại
                khác nhau, từ Fantasy đến Sci-Fi, Tiên Hiệp đến Võ Hiệp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 rounded-xl p-6 transform transition-all hover:scale-105">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">
                AI Thông Minh
              </h3>
              <p className="text-gray-300 text-center">
                Trải nghiệm game với AI tiên tiến, tạo ra nhân vật và cốt truyện
                độc đáo dựa trên mô tả của bạn.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 rounded-xl p-6 transform transition-all hover:scale-105">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">
                Lựa Chọn Có Ý Nghĩa
              </h3>
              <p className="text-gray-300 text-center">
                Mỗi quyết định của bạn đều quan trọng. Khám phá nhiều nhánh cốt
                truyện khác nhau dựa trên lựa chọn của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn Sàng Bắt Đầu Cuộc Phiêu Lưu?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tạo tài khoản ngay hôm nay và bắt đầu hành trình của riêng bạn trong
            thế giới phiêu lưu kỳ diệu.
          </p>

          {!loading &&
            (isLoggedIn ? (
              <Link
                href="/game"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-lg font-bold transition-all inline-block"
              >
                Vào Game Ngay
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-lg font-bold transition-all inline-block"
              >
                Đăng Ký Miễn Phí
              </Link>
            ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900">
        <div className="container mx-auto text-center text-gray-400">
          <p>© 2024 Thế Giới Phiêu Lưu. Tất cả quyền được bảo lưu.</p>
          <p className="mt-2">Backend says: {message || "Loading..."}</p>
        </div>
      </footer>
    </main>
  );
}
