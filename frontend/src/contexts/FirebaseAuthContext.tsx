'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '@/lib/firebase-auth';
import { GameFirestoreService } from '@/lib/firebase-firestore';

interface FirebaseAuthContextType {
  firebaseUser: User | null;
  loading: boolean;
  userProfile: any;
  updateUserProfile: (data: any) => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  loading: true,
  userProfile: null,
  updateUserProfile: async () => {},
  syncWithBackend: async () => {},
});

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Load user profile from Firestore
        try {
          const profile = await GameFirestoreService.getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Create profile if it doesn't exist
          if (!profile) {
            const newProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              gameStats: {
                totalGamesPlayed: 0,
                totalChoicesMade: 0,
                favoriteGenre: null,
                totalPlayTime: 0,
                lastPlayedAt: null,
              },
              preferences: {
                theme: 'dark',
                language: 'vi',
                notifications: true,
                autoSave: true,
              },
              createdAt: new Date().toISOString(),
            };
            
            await GameFirestoreService.createUserProfile(user.uid, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (data: any) => {
    if (!firebaseUser) return;
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await GameFirestoreService.createUserProfile(firebaseUser.uid, updatedProfile);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const syncWithBackend = async () => {
    if (!firebaseUser || !userProfile) return;
    
    try {
      // Sync Firebase user data with backend
      // This can be used to keep both systems in sync
      console.log('Syncing Firebase user with backend...', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        profile: userProfile,
      });
      
      // You can add API call to backend here if needed
      // await axios.post('/api/auth/sync-firebase', {
      //   firebaseUid: firebaseUser.uid,
      //   userData: userProfile,
      // });
    } catch (error) {
      console.error('Error syncing with backend:', error);
    }
  };

  const value = {
    firebaseUser,
    loading,
    userProfile,
    updateUserProfile,
    syncWithBackend,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};