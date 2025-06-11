"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/store/GameContext";
import { useAuth } from "@/store/AuthContext";
import CharacterCard from "@/components/game/CharacterCard";
import Button from "@/components/game/Button";
import LoadingSpinner from "@/components/game/LoadingSpinner";
import Card from "@/components/game/Card";
import { Character } from "@/api/apiClient";

const CharactersPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    characters,
    loadingCharacters,
    error,
    fetchCharacters,
    selectedCharacter,
    setSelectedCharacter,
    startNewGame,
  } = useGame();

  const [isStartingGame, setIsStartingGame] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailCharacter, setDetailCharacter] = useState<Character | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    fetchCharacters();
  }, [authLoading, isAuthenticated, fetchCharacters, router]);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartGame = async (characterId: string) => {
    try {
      setIsStartingGame(true);
      const session = await startNewGame(characterId);
      router.push(`/game/${session.id}`);
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setIsStartingGame(false);
    }
  };

  const viewCharacterDetails = (character: Character) => {
    setDetailCharacter(character);
    setShowDetailsModal(true);
  };

  const closeCharacterDetails = () => {
    setShowDetailsModal(false);
    setDetailCharacter(null);
  };

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
          <p className="mb-6">Bạn cần đăng nhập để xem danh sách nhân vật.</p>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nhân vật của bạn</h1>
          <div className="flex gap-4">
            <Link href="/game/characters/create">
              <Button
                variant="success"
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                }
              >
                Tạo nhân vật mới
              </Button>
            </Link>
            <Link href="/game">
              <Button variant="primary">Quay lại game</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loadingCharacters ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner message="Đang tải danh sách nhân vật..." />
          </div>
        ) : characters.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-xl mb-4">Bạn chưa có nhân vật nào</p>
            <p className="text-gray-400 mb-6">
              Hãy tạo nhân vật đầu tiên của bạn để bắt đầu cuộc phiêu lưu!
            </p>
            <Link href="/game/characters/create">
              <Button variant="success">Tạo nhân vật</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="flex flex-col h-full">
                <CharacterCard
                  character={character}
                  isSelected={selectedCharacter?.id === character.id}
                  onSelect={() => {
                    handleSelectCharacter(character);
                    viewCharacterDetails(character);
                  }}
                  onStartGame={() => handleStartGame(character.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Details Modal */}
      {showDetailsModal && detailCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{detailCharacter.name}</h2>
                <button
                  onClick={closeCharacterDetails}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-300"
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
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">
                          Tên:
                        </span>{" "}
                        {detailCharacter.name}
                      </p>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">
                          Cấp độ:
                        </span>{" "}
                        {detailCharacter.level}
                      </p>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">
                          Kinh nghiệm:
                        </span>{" "}
                        {detailCharacter.experience} XP
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">
                          Thể loại chính:
                        </span>{" "}
                        {detailCharacter.primaryGenre}
                      </p>
                      {detailCharacter.secondaryGenres &&
                        detailCharacter.secondaryGenres.length > 0 && (
                          <p>
                            <span className="text-gray-500 dark:text-gray-400">
                              Thể loại phụ:
                            </span>{" "}
                            {detailCharacter.secondaryGenres.join(", ")}
                          </p>
                        )}
                      <p>
                        <span className="text-gray-500 dark:text-gray-400">
                          Ngày tạo:
                        </span>{" "}
                        {new Date(
                          detailCharacter.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {detailCharacter.description && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                    <p>{detailCharacter.description}</p>
                  </div>
                )}

                {detailCharacter.backstory && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Tiểu sử</h3>
                    <p>{detailCharacter.backstory}</p>
                  </div>
                )}

                {detailCharacter.traits &&
                  detailCharacter.traits.length > 0 && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Đặc điểm</h3>
                      <div className="flex flex-wrap gap-2">
                        {detailCharacter.traits.map((trait, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {detailCharacter.abilities &&
                  detailCharacter.abilities.length > 0 && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Kỹ năng</h3>
                      <div className="flex flex-wrap gap-2">
                        {detailCharacter.abilities.map((ability, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm"
                          >
                            {ability}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="primary"
                    onClick={() => {
                      closeCharacterDetails();
                      handleStartGame(detailCharacter.id);
                    }}
                    isLoading={isStartingGame}
                  >
                    Bắt đầu phiêu lưu
                  </Button>
                  <Button variant="secondary" onClick={closeCharacterDetails}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
