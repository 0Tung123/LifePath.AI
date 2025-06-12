'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const aiButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn-ai",
        outline: "border border-primary bg-transparent text-primary hover:bg-primary/10",
        ghost: "bg-transparent text-primary hover:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        neon: "neon-border bg-background text-primary hover:bg-primary/10",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground border-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
      glow: {
        true: "shadow-glow",
        false: "",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
      pulse: false,
    },
  }
);

export interface AIButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof aiButtonVariants> {
  loading?: boolean;
}

const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(
  ({ className, variant, size, glow, pulse, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(aiButtonVariants({ variant, size, glow, pulse, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
            <span>Đang xử lý...</span>
          </div>
        ) : (
          children
        )}
        
        {variant === 'gradient' && (
          <div className="absolute inset-0 rounded-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"></div>
          </div>
        )}
      </button>
    );
  }
);

AIButton.displayName = "AIButton";

export { AIButton, aiButtonVariants };