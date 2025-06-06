'use client';

import React, { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useGameBackup, useGameStats } from '@/hooks/useFirebase';

interface GameBackupProps {
  gameSession?: any;
  character?: any;
  onBackupSuccess?: () => void;
  onBackupError?: (error: string) => void;
}

export const GameBackup: React.FC<GameBackupProps> = ({
  gameSession,
  character,
  onBackupSuccess,
  onBackupError,
}) => {
  const { firebaseUser } = useFirebaseAuth();
  const { loading, backupGameSession, backupCharacter } = useGameBackup();
  const { incrementGamePlayed } = useGameStats();
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleBackupSession = async () => {
    if (!gameSession || !firebaseUser) return;

    try {
      const backupId = await backupGameSession(gameSession);
      setLastBackup(new Date().toLocaleString());
      await incrementGamePlayed();
      onBackupSuccess?.();
      console.log('Game session backed up:', backupId);
    } catch (error: any) {
      onBackupError?.(error.message);
      console.error('Backup failed:', error);
    }
  };

  const handleBackupCharacter = async () => {
    if (!character || !firebaseUser) return;

    try {
      const backupId = await backupCharacter(character);
      setLastBackup(new Date().toLocaleString());
      onBackupSuccess?.();
      console.log('Character backed up:', backupId);
    } catch (error: any) {
      onBackupError?.(error.message);
      console.error('Backup failed:', error);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
        <p className="text-yellow-400 text-sm">
          Đăng nhập Firebase để backup dữ liệu game
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-white">
          🔄 Backup dữ liệu
        </h3>
        
        <div className="space-y-3">
          {gameSession && (
            <button
              onClick={handleBackupSession}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang backup...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Backup Game Session
                </>
              )}
            </button>
          )}

          {character && (
            <button
              onClick={handleBackupCharacter}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang backup...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Backup Character
                </>
              )}
            </button>
          )}
        </div>

        {lastBackup && (
          <div className="mt-3 p-2 bg-green-900/20 border border-green-800/30 rounded text-sm text-green-400">
            ✅ Backup thành công lúc: {lastBackup}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-400">
          <p>💡 Dữ liệu được lưu trữ an toàn trên Firebase Cloud</p>
          <p>🔒 Chỉ bạn mới có thể truy cập dữ liệu của mình</p>
        </div>
      </div>
    </div>
  );
};