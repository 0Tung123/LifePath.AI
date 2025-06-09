"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  experience: number;
  primaryGenre: string;
  createdAt: string;
  updatedAt: string;
  isDead: boolean;
  epitaph?: string;
  deathDate?: string;
  title?: string;
  gender?: "male" | "female";
  background?: string;
  introduction?: string;
}

const CharactersPage = () => {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await api.get("/game/characters");
        setCharacters(response.data);
      } catch (err) {
        console.error("Error fetching characters:", err);
        setError("Không thể tải danh sách nhân vật. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleStartNewGame = async (characterId: string) => {
    try {
      setLoading(true);
      const response = await api.post("/game/sessions", { characterId });

      if (response.data && response.data.id) {
        // Redirect to the game page
        router.push(`/game/${response.data.id}`);
      }
    } catch (err) {
      console.error("Error starting new game:", err);
      setError("Không thể bắt đầu trò chơi mới. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const viewCharacterDetails = (character: Character) => {
    setSelectedCharacter(character);
  };

  const closeCharacterDetails = () => {
    setSelectedCharacter(null);
  };

  if (loading && characters.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Đang tải nhân vật...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nhân vật của bạn</h1>
          <div className="flex gap-4">
            <Link
              href="/game/characters/create"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition duration-300"
            >
              Tạo nhân vật mới
            </Link>
            <Link
              href="/game"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300"
            >
              Quay lại game
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {characters.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-xl mb-4">Bạn chưa có nhân vật nào</p>
            <p className="text-gray-400 mb-6">
              Hãy tạo nhân vật đầu tiên của bạn để bắt đầu cuộc phiêu lưu!
            </p>
            <Link
              href="/game/characters/create"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md transition duration-300 font-bold"
            >
              Tạo nhân vật
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`bg-gray-800 rounded-lg p-6 shadow-lg relative ${
                  character.isDead ? "border border-red-800" : ""
                }`}
              >
                {character.isDead && (
                  <div className="absolute top-2 right-2 bg-red-800 text-white text-xs px-2 py-1 rounded">
                    Đã hy sinh
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2">
                  {character.title || character.name}
                </h2>
                <p className="text-gray-300">
                  {character.name} - {character.characterClass} Cấp{" "}
                  {character.level}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {character.gender === "male" ? "Nam" : "Nữ"} -{" "}
                  {character.primaryGenre}
                </p>

                {character.isDead ? (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>
                      Ngày mất:{" "}
                      {character.deathDate
                        ? new Date(character.deathDate).toLocaleDateString()
                        : "Không rõ"}
                    </p>
                    {character.epitaph && (
                      <p className="italic mt-2">"{character.epitaph}"</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${character.experience % 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Kinh nghiệm: {character.experience} XP
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => viewCharacterDetails(character)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition duration-300 text-sm"
                  >
                    Chi tiết
                  </button>

                  {!character.isDead && (
                    <button
                      onClick={() => handleStartNewGame(character.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md transition duration-300 text-sm"
                    >
                      Bắt đầu game
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedCharacter.title || selectedCharacter.name}
                </h2>
                <button
                  onClick={closeCharacterDetails}
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="text-gray-400">Tên:</span>{" "}
                        {selectedCharacter.name}
                      </p>
                      <p>
                        <span className="text-gray-400">Lớp:</span>{" "}
                        {selectedCharacter.characterClass}
                      </p>
                      <p>
                        <span className="text-gray-400">Cấp độ:</span>{" "}
                        {selectedCharacter.level}
                      </p>
                      <p>
                        <span className="text-gray-400">Giới tính:</span>{" "}
                        {selectedCharacter.gender === "male" ? "Nam" : "Nữ"}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="text-gray-400">Thể loại:</span>{" "}
                        {selectedCharacter.primaryGenre}
                      </p>
                      <p>
                        <span className="text-gray-400">Ngày tạo:</span>{" "}
                        {new Date(
                          selectedCharacter.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Kinh nghiệm:</span>{" "}
                        {selectedCharacter.experience} XP
                      </p>
                      <p>
                        <span className="text-gray-400">Trạng thái:</span>{" "}
                        {selectedCharacter.isDead ? "Đã hy sinh" : "Còn sống"}
                      </p>
                    </div>
                  </div>
                </div>

                {(selectedCharacter.background ||
                  selectedCharacter.introduction) && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Tiểu sử</h3>

                    {selectedCharacter.background && (
                      <div className="mb-4">
                        <h4 className="text-sm text-gray-400">Bối cảnh:</h4>
                        <p className="mt-1">{selectedCharacter.background}</p>
                      </div>
                    )}

                    {selectedCharacter.introduction && (
                      <div>
                        <h4 className="text-sm text-gray-400">Giới thiệu:</h4>
                        <p className="mt-1">{selectedCharacter.introduction}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedCharacter.isDead && selectedCharacter.epitaph && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Cáo phó</h3>
                    <p className="italic">"{selectedCharacter.epitaph}"</p>
                    {selectedCharacter.deathDate && (
                      <p className="text-sm text-gray-400 mt-2">
                        Ngày mất:{" "}
                        {new Date(
                          selectedCharacter.deathDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  {!selectedCharacter.isDead && (
                    <button
                      onClick={() => {
                        closeCharacterDetails();
                        handleStartNewGame(selectedCharacter.id);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition duration-300"
                    >
                      Bắt đầu phiêu lưu
                    </button>
                  )}
                  <button
                    onClick={closeCharacterDetails}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition duration-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
