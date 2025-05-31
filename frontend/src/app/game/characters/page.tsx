"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// Ánh xạ thể loại sang tiếng Việt
const genreNames = {
  fantasy: "Fantasy",
  modern: "Hiện đại",
  scifi: "Khoa học viễn tưởng",
  xianxia: "Tiên Hiệp",
  wuxia: "Võ Hiệp",
  horror: "Kinh dị",
  cyberpunk: "Cyberpunk",
  steampunk: "Steampunk",
  postapocalyptic: "Hậu tận thế",
  historical: "Lịch sử",
} as const;

type Genre = keyof typeof genreNames;

interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  primaryGenre: Genre;
  secondaryGenres?: Genre[];
  attributes: {
    strength: number;
    intelligence: number;
    dexterity: number;
  };
}

// Xác định màu nền dựa trên thể loại
const getGenreGradient = (genre: Genre | string) => {
  const gradients: Record<string, string> = {
    fantasy: "from-blue-600 to-purple-600",
    modern: "from-gray-600 to-blue-600",
    scifi: "from-cyan-500 to-blue-500",
    xianxia: "from-yellow-400 to-orange-500",
    wuxia: "from-red-500 to-pink-500",
    horror: "from-gray-800 to-red-900",
    cyberpunk: "from-purple-600 to-pink-600",
    steampunk: "from-amber-600 to-yellow-600",
    postapocalyptic: "from-green-900 to-yellow-800",
    historical: "from-amber-800 to-yellow-700",
  };

  return gradients[genre] || "from-blue-600 to-purple-600";
};

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingGame, setStartingGame] = useState(false);
  const [startingCharacterId, setStartingCharacterId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/game/characters");
        setCharacters(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching characters:", err);
        setError("Không thể tải danh sách nhân vật. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const startNewGame = async (characterId: string) => {
    try {
      setStartingGame(true);
      setStartingCharacterId(characterId);
      const response = await axios.post("/api/game/sessions", { characterId });
      router.push(`/game/play/${response.data.id}`);
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Không thể bắt đầu phiên game. Vui lòng thử lại sau.");
      setStartingGame(false);
      setStartingCharacterId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải danh sách nhân vật...
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
            <h1 className="text-3xl font-bold mb-2">Nhân Vật Của Bạn</h1>
            <p className="text-gray-400">
              Quản lý và bắt đầu phiêu lưu với nhân vật của bạn
            </p>
          </div>

          <div className="flex space-x-4">
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

            <Link
              href="/game/characters/create"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Tạo nhân vật mới
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Character List */}
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`bg-gradient-to-br ${getGenreGradient(
                  character.primaryGenre
                )} rounded-xl overflow-hidden shadow-lg transform transition-all hover:scale-[1.02]`}
              >
                <div className="bg-black/30 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{character.name}</h2>
                      <div className="flex items-center">
                        <span>{character.characterClass}</span>
                        <span className="mx-2">•</span>
                        <span className="bg-black/30 px-2 py-0.5 rounded-full text-sm">
                          Cấp {character.level}
                        </span>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-white/20 flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {genreNames[character.primaryGenre] ||
                        character.primaryGenre}
                    </span>
                    {character.secondaryGenres?.map((genre) => (
                      <span
                        key={genre}
                        className="bg-white/10 px-2 py-0.5 rounded-full text-xs"
                      >
                        {genreNames[genre] || genre}
                      </span>
                    ))}
                  </div>

                  {/* Attributes */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-300">Sức mạnh</div>
                      <div className="font-bold">
                        {character.attributes.strength}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-300">Trí tuệ</div>
                      <div className="font-bold">
                        {character.attributes.intelligence}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-300">Nhanh nhẹn</div>
                      <div className="font-bold">
                        {character.attributes.dexterity}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/game/characters/${character.id}`}
                      className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-center"
                    >
                      Chi tiết
                    </Link>
                    <button
                      onClick={() => startNewGame(character.id)}
                      disabled={startingGame}
                      className={`flex-1 px-3 py-2 bg-white/30 hover:bg-white/40 rounded-md transition-colors flex items-center justify-center ${
                        startingGame && startingCharacterId === character.id
                          ? "opacity-70 cursor-wait"
                          : ""
                      }`}
                    >
                      {startingGame && startingCharacterId === character.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Đang bắt đầu...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Bắt đầu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🧙‍♂️</div>
            <h2 className="text-2xl font-bold mb-2">Chưa có nhân vật nào</h2>
            <p className="text-gray-400 mb-6">
              Hãy tạo nhân vật đầu tiên của bạn để bắt đầu cuộc phiêu lưu
            </p>
            <Link
              href="/game/characters/create"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md transition-colors inline-block"
            >
              Tạo nhân vật mới
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
