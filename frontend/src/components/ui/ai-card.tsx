"use client";

import React, { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface AICardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "hover" | "interactive" | "gradient";
  glowing?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export function AICard({
  children,
  className,
  variant = "default",
  glowing = false,
  bordered = true,
  hoverable = false,
  onClick,
}: AICardProps) {
  const baseClasses =
    "relative rounded-lg overflow-hidden bg-card text-card-foreground";

  const variantClasses = {
    default: "",
    hover: "group transition-all duration-300",
    interactive:
      "cursor-pointer transition-all duration-300 hover:scale-[1.02]",
    gradient: "bg-gradient-to-br from-primary/10 to-accent/5",
  };

  const borderClasses = bordered ? "border border-[rgb(var(--border))]" : "";
  const glowClasses = glowing ? "animate-glow" : "";
  const hoverClasses = hoverable
    ? "hover:border-primary/50 hover:shadow-md"
    : "";

  const cursorClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        borderClasses,
        glowClasses,
        hoverClasses,
        cursorClasses,
        className
      )}
      onClick={onClick}
    >
      {children}

      {variant === "hover" && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}

      {glowing && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg blur-xl"></div>
      )}
    </div>
  );
}
