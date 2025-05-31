"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Provider component for Redux store
 */
export default function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}
