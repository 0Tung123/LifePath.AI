"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function GameSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/game/sessions");
        setSessions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Không thể tải danh sách phiên game. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} ngày trước`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return "Vừa xong";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải danh sách phiên game...
          </div>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Phiên Game Của Bạn</h1>
            <p className="text-gray-400">
              Quản lý và tiếp tục các cuộc phiêu lưu của bạn
            </p>
          </div>

          <Link
            href="/game"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Quay lại
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Active Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">
            Phiên Game Đang Hoạt Động
          </h2>

          {sessions.filter((session) => session.isActive).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions
                .filter((session) => session.isActive)
                .map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition-all hover:scale-[1.02]"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {session.character?.name ||
                              "Nhân vật không xác định"}
                          </h3>
                          <div className="text-sm text-gray-400">
                            {session.character?.characterClass} • Cấp{" "}
                            {session.character?.level}
                          </div>
                        </div>

                        <div className="bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs">
                          Đang hoạt động
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Bắt đầu:</span>
                          <span>{formatDate(session.startedAt)}</span>
                        </div>

                        {session.lastSavedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Lưu lần cuối:</span>
                            <span>{getTimeSince(session.lastSavedAt)}</span>
                          </div>
                        )}

                        {session.currentStoryNode?.location && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Vị trí:</span>
                            <span>{session.currentStoryNode.location}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/game/play/${session.id}`}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Tiếp tục phiêu lưu
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">
                Không có phiên game nào đang hoạt động
              </h3>
              <p className="text-gray-400 mb-6">
                Hãy bắt đầu một cuộc phiêu lưu mới với nhân vật của bạn
              </p>
              <Link
                href="/game"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-block"
              >
                Bắt đầu phiêu lưu mới
              </Link>
            </div>
          )}
        </div>

        {/* Completed Sessions */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-purple-400">
            Phiên Game Đã Kết Thúc
          </h2>

          {sessions.filter((session) => !session.isActive).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-4 py-3 text-left">Nhân vật</th>
                    <th className="px-4 py-3 text-left">Bắt đầu</th>
                    <th className="px-4 py-3 text-left">Kết thúc</th>
                    <th className="px-4 py-3 text-left">Thời gian chơi</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions
                    .filter((session) => !session.isActive)
                    .map((session) => {
                      // Tính thời gian chơi
                      const startDate = new Date(session.startedAt);
                      const endDate = new Date(session.endedAt);
                      const playTimeMs = endDate - startDate;
                      const playTimeHours = Math.floor(
                        playTimeMs / (1000 * 60 * 60)
                      );
                      const playTimeMinutes = Math.floor(
                        (playTimeMs % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      const playTimeFormatted = `${playTimeHours}h ${playTimeMinutes}m`;

                      return (
                        <tr
                          key={session.id}
                          className="border-b border-gray-700 hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">
                                {session.character?.name ||
                                  "Nhân vật không xác định"}
                              </div>
                              <div className="text-sm text-gray-400">
                                {session.character?.characterClass} • Cấp{" "}
                                {session.character?.level}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(session.startedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(session.endedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {playTimeFormatted}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await axios.post(
                                    "/api/game/sessions",
                                    { characterId: session.character.id }
                                  );
                                  router.push(`/game/play/${response.data.id}`);
                                } catch (err) {
                                  console.error(
                                    "Error starting new game:",
                                    err
                                  );
                                  setError(
                                    "Không thể bắt đầu phiên game mới. Vui lòng thử lại sau."
                                  );
                                }
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-sm"
                            >
                              Chơi lại
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400">
                Bạn chưa có phiên game nào đã kết thúc
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
