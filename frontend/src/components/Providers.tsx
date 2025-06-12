"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { GameProvider } from "../contexts/GameContext";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <GameProvider>{children}</GameProvider>
    </AuthProvider>
  );
};

export default Providers;
