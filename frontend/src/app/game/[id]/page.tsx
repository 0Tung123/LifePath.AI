"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameLayout from "@/components/game/GameLayout";
import api from "@/utils/api";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

const GamePage = ({ params }: PageProps) => {
  const router = useRouter();
  const { id: gameSessionId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    const checkGameSession = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/game/sessions/${gameSessionId}`);

        // Kiểm tra xem phiên game có còn hoạt động không
        if (response.data && response.data.isActive) {
          setIsSessionValid(true);
        } else {
          setError("Phiên chơi game này không còn hoạt động hoặc đã kết thúc.");
        }
      } catch (err) {
        console.error("Error checking game session:", err);
        setError("Không thể tải phiên chơi game. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (gameSessionId) {
      checkGameSession();
    }
  }, [gameSessionId]);

  const handleEndGame = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn kết thúc phiên chơi này? Bạn sẽ không thể tiếp tục phiên này nữa."
      )
    ) {
      try {
        setLoading(true);
        await api.put(`/game/sessions/${gameSessionId}/end`);

        // Redirect to game home
        router.push("/game");
      } catch (err) {
        console.error("Error ending game session:", err);
        setError("Không thể kết thúc phiên chơi game. Vui lòng thử lại sau.");
        setLoading(false);
      }
    }
  };

  const handleSaveGame = async () => {
    try {
      await api.put(`/game/sessions/${gameSessionId}/save`);
      alert("Đã lưu trò chơi thành công!");
    } catch (err) {
      console.error("Error saving game:", err);
      setError("Không thể lưu trò chơi. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Đang tải phiên chơi game...</div>
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

  if (!isSessionValid) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Phiên chơi không hợp lệ</h1>
          <p className="mb-6">
            Phiên chơi này không tồn tại hoặc đã kết thúc. Vui lòng bắt đầu một
            phiên chơi mới.
          </p>
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
      {/* Game controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link
              href="/game"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300 mr-4"
            >
              Quay lại Menu
            </Link>
          </div>

          <div className="space-x-4">
            <button
              onClick={handleSaveGame}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition duration-300"
            >
              Lưu Game
            </button>
            <button
              onClick={handleEndGame}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition duration-300"
            >
              Kết thúc phiên
            </button>
          </div>
        </div>
      </div>

      {/* Game content */}
      <GameLayout gameSessionId={gameSessionId} />
    </div>
  );
};

export default GamePage;
