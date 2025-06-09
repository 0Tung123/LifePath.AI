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
  createdAt: string;
  primaryGenre: string;
  title?: string;
  isDead: boolean;
}

interface GameSession {
  id: string;
  characterId: string;
  isActive: boolean;
  createdAt: string;
  lastSavedAt: string;
}

const GameHomePage = () => {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch characters
        const charactersResponse = await api.get("/game/characters");
        setCharacters(charactersResponse.data);
        
        // Fetch active game sessions
        const sessionsResponse = await api.get("/game/sessions");
        setSessions(sessionsResponse.data);
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Không thể tải dữ liệu game. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startNewGame = async (characterId: string) => {
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

  const continueGame = (sessionId: string) => {
    router.push(`/game/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Nhập Vai A.I Simulator</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Active Game Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Phiên chơi đang hoạt động</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => {
                const character = characters.find(c => c.id === session.characterId);
                return (
                  <div 
                    key={session.id} 
                    className="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-750 transition duration-300 cursor-pointer"
                    onClick={() => continueGame(session.id)}
                  >
                    <h3 className="text-xl font-bold mb-2">
                      {character?.title || "Cuộc phiêu lưu mới"}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {character?.name} - {character?.characterClass} Cấp {character?.level}
                    </p>
                    <p className="text-sm text-gray-400">
                      Phiên chơi được tạo: {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Lưu lần cuối: {new Date(session.lastSavedAt).toLocaleString()}
                    </p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300">
                      Tiếp tục chơi
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Characters List */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Nhân vật của bạn</h2>
            <Link 
              href="/game/characters/create"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition duration-300"
            >
              Tạo nhân vật mới
            </Link>
          </div>

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
                  className={`bg-gray-800 rounded-lg p-6 shadow-lg ${
                    character.isDead 
                      ? "opacity-75 border border-red-800" 
                      : "hover:bg-gray-750 cursor-pointer"
                  }`}
                  onClick={() => !character.isDead && startNewGame(character.id)}
                >
                  {character.isDead && (
                    <div className="absolute top-2 right-2 bg-red-800 text-white text-xs px-2 py-1 rounded">
                      Đã hy sinh
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">
                    {character.title || character.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {character.name} - {character.characterClass} Cấp {character.level}
                  </p>
                  <p className="text-sm text-gray-400">
                    Thể loại: {character.primaryGenre}
                  </p>
                  <p className="text-sm text-gray-400">
                    Ngày tạo: {new Date(character.createdAt).toLocaleDateString()}
                  </p>
                  
                  {!character.isDead && (
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition duration-300">
                      Bắt đầu phiêu lưu mới
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Links nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/game/characters"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Quản lý nhân vật
            </Link>
            <Link 
              href="/dashboard"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Bảng điều khiển
            </Link>
            <Link 
              href="/"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHomePage;