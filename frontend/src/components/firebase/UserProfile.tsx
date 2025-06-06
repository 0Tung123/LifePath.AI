'use client';

import React, { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useGameStats, useFileUpload } from '@/hooks/useFirebase';

export const UserProfile: React.FC = () => {
  const { firebaseUser, userProfile, updateUserProfile } = useFirebaseAuth();
  const { gameStats } = useGameStats();
  const { uploading, progress, uploadAvatar } = useFileUpload();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || '');

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarUrl = await uploadAvatar(file);
      await updateUserProfile({ photoURL: avatarUrl });
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({ displayName });
      setEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={userProfile?.photoURL || firebaseUser.photoURL || '/default-avatar.png'}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Tên hiển thị"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white">
                  {userProfile?.displayName || firebaseUser.displayName || 'Người chơi'}
                </h2>
                <p className="text-gray-400">{firebaseUser.email}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Chỉnh sửa
                </button>
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">Đang upload avatar... {Math.round(progress)}%</p>
          </div>
        )}
      </div>

      {/* Game Statistics */}
      <div className="p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">📊 Thống kê Game</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {gameStats?.totalGamesPlayed || 0}
            </div>
            <div className="text-sm text-gray-400">Game đã chơi</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {gameStats?.totalChoicesMade || 0}
            </div>
            <div className="text-sm text-gray-400">Lựa chọn đã thực hiện</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((gameStats?.totalPlayTime || 0) / 60)}h
            </div>
            <div className="text-sm text-gray-400">Thời gian chơi</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {gameStats?.favoriteGenre || 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Thể loại yêu thích</div>
          </div>
        </div>

        {gameStats?.lastPlayedAt && (
          <div className="mt-4 text-sm text-gray-400">
            Lần chơi cuối: {new Date(gameStats.lastPlayedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">⚙️ Tùy chọn</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Thông báo</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userProfile?.preferences?.notifications || false}
                onChange={(e) => updateUserProfile({
                  preferences: {
                    ...userProfile?.preferences,
                    notifications: e.target.checked,
                  }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Tự động lưu</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userProfile?.preferences?.autoSave || false}
                onChange={(e) => updateUserProfile({
                  preferences: {
                    ...userProfile?.preferences,
                    autoSave: e.target.checked,
                  }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};