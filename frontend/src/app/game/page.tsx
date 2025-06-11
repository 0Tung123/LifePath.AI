'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGame } from '@/store/GameContext';
import { useAuth } from '@/store/AuthContext';
import CharacterCard from '@/components/game/CharacterCard';
import Button from '@/components/game/Button';
import Card from '@/components/game/Card';
import LoadingSpinner from '@/components/game/LoadingSpinner';

const GameHomePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    characters, 
    gameSessions, 
    loadingCharacters, 
    loadingSession,
    error,
    fetchCharacters, 
    fetchGameSessions,
    startNewGame,
  } = useGame();
  
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Fetch game data
    fetchCharacters();
    fetchGameSessions();
  }, [authLoading, isAuthenticated, fetchCharacters, fetchGameSessions, router]);

  const handleStartNewGame = async (characterId: string) => {
    try {
      setIsStartingGame(true);
      const session = await startNewGame(characterId);
      router.push(`/game/${session.id}`);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsStartingGame(false);
    }
  };

  const continueGame = (sessionId: string) => {
    router.push(`/game/${sessionId}`);
  };

  if (authLoading || loadingCharacters && characters.length === 0) {
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
            Bạn cần đăng nhập để truy cập game.
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
        {gameSessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Phiên chơi đang hoạt động</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameSessions.map((session) => {
                const character = characters.find(c => c.id === session.characterId);
                if (!character) return null;
                
                return (
                  <Card 
                    key={session.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => continueGame(session.id)}
                    footer={
                      <Button 
                        variant="primary" 
                        isFullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          continueGame(session.id);
                        }}
                      >
                        Tiếp tục chơi
                      </Button>
                    }
                  >
                    <h3 className="text-xl font-bold mb-3">
                      {character.name}
                    </h3>
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Cấp độ {character.level} • {character.primaryGenre}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Bắt đầu: {new Date(session.startedAt).toLocaleDateString()}</p>
                      <p>Lần chơi gần nhất: {new Date(session.updatedAt).toLocaleString()}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Characters List */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Nhân vật của bạn</h2>
            <Link href="/game/characters/create">
              <Button
                variant="success"
                leftIcon={
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Tạo nhân vật mới
              </Button>
            </Link>
          </div>

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
                <Button variant="success">
                  Tạo nhân vật
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.slice(0, 3).map((character) => (
                <div key={character.id} className="flex flex-col h-full">
                  <CharacterCard
                    character={character}
                    onStartGame={() => handleStartNewGame(character.id)}
                  />
                </div>
              ))}
              {characters.length > 3 && (
                <Link href="/game/characters" className="col-span-full text-center mt-4">
                  <Button variant="secondary">
                    Xem tất cả nhân vật ({characters.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <Card className="mb-6">
          <h2 className="text-xl font-medium mb-4">Links nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/game/characters"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Quản lý nhân vật
            </Link>
            <Link 
              href="/dashboard"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Bảng điều khiển
            </Link>
            <Link 
              href="/"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md transition duration-300 text-center"
            >
              Trang chủ
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameHomePage;