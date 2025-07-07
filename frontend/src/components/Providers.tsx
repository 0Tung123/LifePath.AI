'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { GameProvider } from '../contexts/GameContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  // Only show the UI after first client-side render to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      <GameProvider>
        {mounted ? (
          children
        ) : (
          <div style={{ visibility: 'hidden' }}>{children}</div>
        )}
      </GameProvider>
    </AuthProvider>
  );
};

export default Providers;
