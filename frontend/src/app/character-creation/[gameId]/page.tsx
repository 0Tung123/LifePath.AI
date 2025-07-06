'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import Header from '@/components/Header';
import CharacterCreationWizard from '@/components/CharacterCreation/CharacterCreationWizard';
import { CharacterCreationResult } from '@/types/character-creation.types';
import { Game } from '@/services/game.service';

export default function CharacterCreationPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getGameById } = useGame();

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId || typeof gameId !== 'string') {
        setError('Invalid game ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const gameData = await getGameById(gameId);
        setGame(gameData);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && gameId) {
      loadGame();
    }
  }, [isAuthenticated, gameId, getGameById]);

  const handleCharacterCreationComplete = (result: CharacterCreationResult) => {
    console.log('Character creation completed:', result);
    // Navigate to the game screen
    router.push(`/game/${gameId}`);
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    router.push('/dashboard');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Không tìm thấy game
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tạo Nhân Vật
                </h1>
                <p className="text-gray-600 mt-2">
                  Tùy chỉnh nhân vật cho cuộc phiêu lưu:{' '}
                  {game.settings.characterName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Thể loại:{' '}
                  <span className="font-semibold">{game.settings.theme}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Bối cảnh:{' '}
                  <span className="font-semibold">{game.settings.setting}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Character Creation Wizard */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <CharacterCreationWizard
              gameId={gameId as string}
              worldType={game.settings.theme}
              characterName={game.settings.characterName}
              initialBackstory={game.settings.characterBackstory}
              onComplete={handleCharacterCreationComplete}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
