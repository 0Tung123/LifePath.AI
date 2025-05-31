"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/utils/api";
import { User } from "@/types/auth.types";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/status");
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        } else {
          router.push("/login?redirect=" + encodeURIComponent(pathname));
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login?redirect=" + encodeURIComponent(pathname));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Kiểm tra xem đường dẫn hiện tại có phải là trang gameplay không
  const isGameplayPage = pathname.includes("/game/play/");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải...
          </div>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Nếu là trang gameplay, không hiển thị header và footer
  if (isGameplayPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/game" className="text-2xl font-bold">
                Thế Giới Phiêu Lưu
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/game"
                  className={`transition-colors ${
                    pathname === "/game"
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Trang Chủ
                </Link>
                <Link
                  href="/game/characters"
                  className={`transition-colors ${
                    pathname.includes("/game/characters")
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Nhân Vật
                </Link>
                <Link
                  href="/game/sessions"
                  className={`transition-colors ${
                    pathname.includes("/game/sessions")
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Phiên Game
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center">
                  <div className="hidden md:block mr-4">
                    <div className="font-medium">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.lastName || "Người chơi"}
                    </div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>

                  <div className="relative group">
                    <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {(user.firstName || user.lastName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </button>

                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Trang Cá Nhân
                        </Link>
                        <Link
                          href="/game/characters"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Nhân Vật Của Tôi
                        </Link>
                        <Link
                          href="/game/sessions"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Phiên Game
                        </Link>
                        <hr className="border-gray-700 my-1" />
                        <button
                          onClick={async () => {
                            try {
                              await api.post("/auth/logout");
                              router.push("/");
                            } catch (error) {
                              console.error("Logout error:", error);
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                        >
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-lg font-bold mb-1">Thế Giới Phiêu Lưu</div>
              <div className="text-sm text-gray-400">
                © 2024 Tất cả quyền được bảo lưu
              </div>
            </div>

            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                href="/game"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Game
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Trang Cá Nhân
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
