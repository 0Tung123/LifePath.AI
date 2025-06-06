import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirestoreService, GameFirestoreService } from '@/lib/firebase-firestore';
import { FirebaseStorageService } from '@/lib/firebase-storage';

// Hook for game data backup
export const useGameBackup = () => {
  const { firebaseUser } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  const backupGameSession = async (sessionData: any) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const backupData = {
        ...sessionData,
        userId: firebaseUser.uid,
        backupAt: new Date().toISOString(),
      };
      
      const backupId = await GameFirestoreService.backupGameSession(backupData);
      return backupId;
    } finally {
      setLoading(false);
    }
  };

  const backupCharacter = async (characterData: any) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const backupData = {
        ...characterData,
        userId: firebaseUser.uid,
        backupAt: new Date().toISOString(),
      };
      
      const backupId = await GameFirestoreService.backupCharacter(backupData);
      return backupId;
    } finally {
      setLoading(false);
    }
  };

  const getUserGameSessions = async () => {
    if (!firebaseUser) return [];
    
    setLoading(true);
    try {
      return await GameFirestoreService.getUserGameSessions(firebaseUser.uid);
    } finally {
      setLoading(false);
    }
  };

  const getUserCharacters = async () => {
    if (!firebaseUser) return [];
    
    setLoading(true);
    try {
      return await GameFirestoreService.getUserCharacters(firebaseUser.uid);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    backupGameSession,
    backupCharacter,
    getUserGameSessions,
    getUserCharacters,
  };
};

// Hook for file uploads
export const useFileUpload = () => {
  const { firebaseUser } = useFirebaseAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAvatar = async (file: File) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    
    setUploading(true);
    setProgress(0);
    
    try {
      const url = await FirebaseStorageService.uploadAvatar(
        firebaseUser.uid,
        file,
        (progress) => setProgress(progress)
      );
      return url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadCharacterImage = async (characterId: string, file: File) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    
    setUploading(true);
    setProgress(0);
    
    try {
      const url = await FirebaseStorageService.uploadCharacterImage(
        firebaseUser.uid,
        characterId,
        file,
        (progress) => setProgress(progress)
      );
      return url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadGameScreenshot = async (sessionId: string, file: File) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    
    setUploading(true);
    setProgress(0);
    
    try {
      const url = await FirebaseStorageService.uploadGameScreenshot(
        firebaseUser.uid,
        sessionId,
        file,
        (progress) => setProgress(progress)
      );
      return url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploading,
    progress,
    uploadAvatar,
    uploadCharacterImage,
    uploadGameScreenshot,
  };
};

// Hook for real-time data
export const useRealtimeData = (collectionName: string, userId?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionName) return;

    const constraints = userId ? [
      // Add where clause for userId if provided
    ] : [];

    const unsubscribe = FirestoreService.onSnapshot(
      collectionName,
      (newData) => {
        setData(newData);
        setLoading(false);
        setError(null);
      },
      constraints
    );

    return () => unsubscribe();
  }, [collectionName, userId]);

  return { data, loading, error };
};

// Hook for game statistics
export const useGameStats = () => {
  const { firebaseUser, userProfile, updateUserProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  const updateGameStats = async (stats: any) => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      const currentStats = userProfile?.gameStats || {};
      const updatedStats = {
        ...currentStats,
        ...stats,
        lastUpdated: new Date().toISOString(),
      };
      
      await updateUserProfile({
        gameStats: updatedStats,
      });
      
      // Also update in separate game_stats collection
      await GameFirestoreService.updateGameStats(firebaseUser.uid, updatedStats);
    } finally {
      setLoading(false);
    }
  };

  const incrementGamePlayed = async () => {
    const currentStats = userProfile?.gameStats || {};
    await updateGameStats({
      totalGamesPlayed: (currentStats.totalGamesPlayed || 0) + 1,
      lastPlayedAt: new Date().toISOString(),
    });
  };

  const incrementChoicesMade = async (count = 1) => {
    const currentStats = userProfile?.gameStats || {};
    await updateGameStats({
      totalChoicesMade: (currentStats.totalChoicesMade || 0) + count,
    });
  };

  const updatePlayTime = async (minutes: number) => {
    const currentStats = userProfile?.gameStats || {};
    await updateGameStats({
      totalPlayTime: (currentStats.totalPlayTime || 0) + minutes,
    });
  };

  return {
    loading,
    gameStats: userProfile?.gameStats,
    updateGameStats,
    incrementGamePlayed,
    incrementChoicesMade,
    updatePlayTime,
  };
};