"use client";

import { ReactNode } from "react";
import { ApiInitializer } from "@/utils/api-initializer";

interface ApiInitializerWrapperProps {
  children: ReactNode;
}

export function ApiInitializerWrapper({ children }: ApiInitializerWrapperProps) {
  return (
    <>
      <ApiInitializer />
      {children}
    </>
  );
}