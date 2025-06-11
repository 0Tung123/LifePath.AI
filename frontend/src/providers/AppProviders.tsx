import React, { ReactNode } from 'react';
import { AuthProvider } from '../store/AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {/* Add other providers here as needed */}
      {children}
    </AuthProvider>
  );
};

export default AppProviders;