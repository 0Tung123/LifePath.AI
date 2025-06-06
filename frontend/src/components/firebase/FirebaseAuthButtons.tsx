'use client';

import React, { useState } from 'react';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithTwitter,
  signOutUser,
} from '@/lib/firebase-auth';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface FirebaseAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const FirebaseAuthButtons: React.FC<FirebaseAuthButtonsProps> = ({
  onSuccess,
  onError,
}) => {
  const { firebaseUser, loading } = useFirebaseAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithFacebook();
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithTwitter();
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (firebaseUser) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
          {firebaseUser.photoURL && (
            <img
              src={firebaseUser.photoURL}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="text-green-400 font-medium">
              {firebaseUser.displayName || firebaseUser.email}
            </p>
            <p className="text-sm text-gray-400">Đã đăng nhập với Firebase</p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Đăng xuất Firebase
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 text-center mb-4">
        Đăng nhập với Firebase để backup dữ liệu
      </p>
      
      <button
        onClick={handleGoogleSignIn}
        disabled={signingIn}
        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {signingIn ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
      </button>

      <button
        onClick={handleFacebookSignIn}
        disabled={signingIn}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {signingIn ? 'Đang đăng nhập...' : 'Đăng nhập với Facebook'}
      </button>

      <button
        onClick={handleTwitterSignIn}
        disabled={signingIn}
        className="w-full flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        {signingIn ? 'Đang đăng nhập...' : 'Đăng nhập với Twitter'}
      </button>
    </div>
  );
};