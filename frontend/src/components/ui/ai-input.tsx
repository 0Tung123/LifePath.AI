"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const aiInputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        neon: "neon-border focus-visible:ring-primary",
        terminal:
          "font-mono bg-card border-primary/30 focus-visible:border-primary",
        minimal: "border-none bg-muted/30 focus-visible:bg-muted/50",
        underlined:
          "border-t-0 border-l-0 border-r-0 rounded-none px-1 border-b-2 border-muted focus-visible:border-b-primary",
      },
      glow: {
        true: "focus:shadow-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
);

export interface AIInputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof aiInputVariants> {
  icon?: React.ReactNode;
}

const AIInput = forwardRef<HTMLInputElement, AIInputProps>(
  ({ className, variant, glow, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={cn(
            aiInputVariants({ variant, glow, className }),
            icon && "pl-10"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

AIInput.displayName = "AIInput";

export { AIInput, aiInputVariants };
