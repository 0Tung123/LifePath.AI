"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GameLayout from "@/components/game/GameLayout";
import { useGame } from "@/store/GameContext";
import { useAuth } from "@/store/AuthContext";
import LoadingSpinner from "@/components/game/LoadingSpinner";

interface PageProps {
  params: {
    id: string;
  };
}

const GamePage = ({ params }: PageProps) => {
  const router = useRouter();
  const { id: gameSessionId } = params;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { error } = useGame();

  // Kiểm tra xác thực
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <LoadingSpinner size="large" message="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để tiếp tục</h1>
          <p className="mb-6">
            Bạn cần đăng nhập để truy cập phiên chơi game này.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition duration-300"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h1>
          <p className="mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/game"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition duration-300"
            >
              Quay lại trang chính
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Game content - GameLayout đã bao gồm điều khiển game */}
      <GameLayout gameSessionId={gameSessionId} />
    </div>
  );
};

export default GamePage;
