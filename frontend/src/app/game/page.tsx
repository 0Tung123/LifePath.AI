"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// Type definitions
interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  primaryGenre: string;
}

interface GameSession {
  id: string;
  startedAt: string;
  character?: Character;
}

export default function GameHomePage() {
  const router = useRouter();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch active game sessions
        const sessionsResponse = await axios.get("/api/game/sessions");
        setActiveSessions(sessionsResponse.data);

        // Fetch characters
        const charactersResponse = await axios.get("/api/game/characters");
        setCharacters(charactersResponse.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load game data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl font-bold mb-4">
            Đang tải thế giới...
          </div>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Lỗi</div>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
        <div className="absolute inset-0 bg-[url('/images/game-hero.jpg')] bg-cover bg-center"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow-lg">
            Thế Giới Phiêu Lưu
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Bước vào cuộc hành trình kỳ diệu, nơi mỗi lựa chọn định hình số phận
            của bạn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Active Sessions */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all hover:scale-[1.02]">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">
              Phiên Game Đang Hoạt Động
            </h2>

            {activeSessions.length > 0 ? (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {session.character?.name || "Nhân vật không xác định"}
                        </h3>
                        <p className="text-gray-300">
                          Bắt đầu:{" "}
                          {new Date(session.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/game/play/${session.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        Tiếp tục
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Bạn chưa có phiên game nào đang hoạt động
                </p>
                <p className="text-gray-300">
                  Hãy tạo nhân vật và bắt đầu cuộc phiêu lưu mới!
                </p>
              </div>
            )}
          </div>

          {/* Characters */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all hover:scale-[1.02]">
            <h2 className="text-3xl font-bold mb-6 text-green-400">
              Nhân Vật Của Bạn
            </h2>

            {characters.length > 0 ? (
              <div className="space-y-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {character.name}
                        </h3>
                        <p className="text-gray-300">
                          {character.characterClass} - Cấp {character.level}
                        </p>
                        <p className="text-gray-400">
                          {character.primaryGenre}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/game/characters/${character.id}`}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        >
                          Chi tiết
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              const response = await axios.post(
                                "/api/game/sessions",
                                { characterId: character.id }
                              );
                              router.push(`/game/play/${response.data.id}`);
                            } catch (err) {
                              console.error("Error starting game:", err);
                              setError(
                                "Failed to start game. Please try again."
                              );
                            }
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                        >
                          Bắt đầu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Bạn chưa có nhân vật nào</p>
                <Link
                  href="/game/characters/create"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors inline-block"
                >
                  Tạo nhân vật mới
                </Link>
              </div>
            )}

            {characters.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/game/characters/create"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors inline-block"
                >
                  Tạo nhân vật mới
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Chinese Novel Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white text-center shadow-lg">
            <h2 className="text-4xl font-bold mb-4">
              🏮 Tiểu Thuyết Mạng Trung Quốc 🏮
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Tạo và đọc những câu chuyện tương tác đầy màu sắc với AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/game/chinese-novel"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                📚 Xem Tiểu Thuyết
              </Link>
              <Link
                href="/game/chinese-novel/create"
                className="px-6 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors font-semibold"
              >
                ✨ Tạo Tiểu Thuyết Mới
              </Link>
            </div>
          </div>
        </div>

        {/* Game Genres */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Khám Phá Các Thế Giới
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              {
                id: "fantasy",
                name: "Fantasy",
                description:
                  "Thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí",
                color: "from-blue-600 to-purple-600",
              },
              {
                id: "scifi",
                name: "Sci-Fi",
                description:
                  "Thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ",
                color: "from-cyan-500 to-blue-500",
              },
              {
                id: "xianxia",
                name: "Tiên Hiệp",
                description:
                  "Thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới",
                color: "from-yellow-400 to-orange-500",
              },
              {
                id: "wuxia",
                name: "Võ Hiệp",
                description: "Thế giới võ thuật, giang hồ, kiếm hiệp",
                color: "from-red-500 to-pink-500",
              },
              {
                id: "cyberpunk",
                name: "Cyberpunk",
                description: "Thế giới tương lai đen tối với công nghệ cao",
                color: "from-purple-600 to-pink-600",
              },
            ].map((genre) => (
              <div
                key={genre.id}
                className="relative group overflow-hidden rounded-xl h-64 shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-75 group-hover:opacity-90 transition-opacity`}
                ></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{genre.name}</h3>
                  <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {genre.description}
                  </p>
                  <Link
                    href={`/game/characters/create?genre=${genre.id}`}
                    className="mt-4 px-3 py-1 bg-white text-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-sm font-medium"
                  >
                    Tạo nhân vật
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
