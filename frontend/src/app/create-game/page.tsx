'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

import Header from '@/components/Header';
import BackstoryGuide from '@/components/BackstoryGuide';
import { GameSettings, GameTheme } from '@/types/shared';

export default function CreateGame() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { createGame, isLoading: gameLoading, error: gameError } = useGame();
  const router = useRouter();

  const [formData, setFormData] = useState<GameSettings>({
    theme: GameTheme.FANTASY,
    setting: '',
    characterName: '',
    characterBackstory: '',
    additionalSettings: {
      style: 'Vietnamese',
      difficulty: 'medium',
      gameLength: 'medium',
      combatStyle: 'balanced',
    },
  });

  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Update error state when game error changes
  useEffect(() => {
    if (gameError) {
      setError(gameError);
    }
  }, [gameError]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof GameSettings] as Record<
            string,
            unknown
          >),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const game = await createGame(formData);
      router.push(`/game/${game.id}`);
    } catch {
      setError('Failed to create game. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo cuộc phiêu lưu mới
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              Quay lại Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {error && (
                <div
                  className="p-4 mb-6 text-red-700 bg-red-100 rounded-md"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Thể loại
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      required
                      value={formData.theme}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn thể loại</option>
                      <option value={GameTheme.FANTASY}>
                        Giả tưởng (Fantasy)
                      </option>
                      <option value={GameTheme.SCIFI}>
                        Khoa học viễn tưởng (Sci-Fi)
                      </option>
                      <option value={GameTheme.MODERN}>Hiện đại</option>
                      <option value={GameTheme.HISTORICAL}>Lịch sử</option>
                      <option value={GameTheme.HORROR}>Kinh dị</option>
                      <option value={GameTheme.MYSTERY}>Bí ẩn</option>
                      <option value={GameTheme.ROMANCE}>Lãng mạn</option>
                      <option value={GameTheme.ADVENTURE}>Phiêu lưu</option>
                      <option value={GameTheme.SLICE_OF_LIFE}>
                        Đời thường
                      </option>
                      <option value={GameTheme.CYBERPUNK}>Cyberpunk</option>
                      <option value={GameTheme.STEAMPUNK}>Steampunk</option>
                      <option value={GameTheme.APOCALYPSE}>Hậu tận thế</option>
                      <option value={GameTheme.SUPERHERO}>Siêu Anh Hùng</option>
                      <option value={GameTheme.MARTIAL_ARTS}>Võ hiệp</option>
                      <option value={GameTheme.CULTIVATION}>Tu Luyện</option>
                      <option value={GameTheme.ISEKAI}>Isekai</option>
                      <option value={GameTheme.REINCARNATION}>Tái sinh</option>
                      <option value={GameTheme.REGRESSION}>Hồi quy</option>
                      <option value={GameTheme.SYSTEM}>Hệ thống</option>
                      <option value={GameTheme.VILLAINESS}>Nữ phản diện</option>
                      <option value={GameTheme.OTOME}>Otome</option>
                      <option value={GameTheme.CUSTOM}>Tùy chỉnh</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="setting"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bối cảnh thế giới
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                      Mô tả môi trường, thời đại, địa điểm mà cuộc phiêu lưu sẽ
                      diễn ra
                    </p>
                    <input
                      type="text"
                      name="setting"
                      id="setting"
                      required
                      placeholder="VD: Vương quốc thời trung cổ, Trạm vũ trụ, Thế giới zombie hậu tận thế"
                      value={formData.setting}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="characterName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tên nhân vật
                    </label>
                    <input
                      type="text"
                      name="characterName"
                      id="characterName"
                      required
                      value={formData.characterName}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="additionalSettings.style"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phong cách kể chuyện
                    </label>
                    <select
                      id="additionalSettings.style"
                      name="additionalSettings.style"
                      value={formData.additionalSettings?.style}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Vietnamese">
                        Vietnamese Style (Truyền thống Việt Nam)
                      </option>
                      <option value="Chinese">
                        Chinese Style (Tiên Hiệp, Huyền Huyễn)
                      </option>
                      <option value="Korean">
                        Korean Style (Murim, Hunter, Học Đường)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="additionalSettings.difficulty"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Độ khó
                    </label>
                    <select
                      id="additionalSettings.difficulty"
                      name="additionalSettings.difficulty"
                      value={formData.additionalSettings?.difficulty}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                  <BackstoryGuide
                    value={formData.characterBackstory}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={gameLoading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {gameLoading
                      ? 'Đang tạo cuộc phiêu lưu...'
                      : 'Bắt đầu cuộc phiêu lưu mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
