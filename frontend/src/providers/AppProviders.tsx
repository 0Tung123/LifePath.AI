"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "../store/AuthContext";
import { GameProvider } from "../store/GameContext";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <GameProvider>{children}</GameProvider>
    </AuthProvider>
  );
};

export default AppProviders;
