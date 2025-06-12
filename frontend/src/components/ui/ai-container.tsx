"use client";

import React, { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface AIContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "terminal" | "glass" | "card";
  glowing?: boolean;
  animated?: boolean;
}

export function AIContainer({
  children,
  className,
  variant = "default",
  glowing = false,
  animated = false,
}: AIContainerProps) {
  const baseClasses = "relative rounded-lg overflow-hidden";

  const variantClasses = {
    default: "bg-card border border-[rgb(var(--border))] p-6",
    terminal: "ai-terminal p-4 font-mono",
    glass: "glass p-6 border border-primary/20",
    card: "ai-card p-6",
  };

  const glowClasses = glowing ? "animate-glow" : "";
  const animationClasses = animated
    ? "transition-all duration-300 hover:scale-[1.02]"
    : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        glowClasses,
        animationClasses,
        className
      )}
    >
      {variant === "terminal" && (
        <div className="flex items-center gap-1.5 absolute top-3 left-3">
          <div className="w-3 h-3 rounded-full bg-destructive"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      )}

      {variant === "terminal" ? (
        <div className="pt-6">{children}</div>
      ) : (
        children
      )}

      {glowing && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg blur-xl"></div>
      )}
    </div>
  );
}
