'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface AITextProps {
  children: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'neon' | 'typing' | 'glitch';
  as?: React.ElementType;
  delay?: number;
  speed?: number;
}

export function AIText({
  children,
  className,
  variant = 'default',
  as: Component = 'span',
  delay = 0,
  speed = 50,
}: AITextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(variant === 'typing');
  
  useEffect(() => {
    if (variant === 'typing') {
      let currentText = '';
      let currentIndex = 0;
      
      setTimeout(() => {
        const typingInterval = setInterval(() => {
          if (currentIndex < children.length) {
            currentText += children[currentIndex];
            setDisplayText(currentText);
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);
          }
        }, speed);
        
        return () => clearInterval(typingInterval);
      }, delay);
    } else {
      setDisplayText(children);
    }
  }, [children, delay, speed, variant]);
  
  const variantClasses = {
    default: "text-foreground",
    gradient: "text-gradient",
    neon: "neon-text",
    typing: "font-mono",
    glitch: "relative text-foreground",
  };
  
  return (
    <Component
      className={cn(
        variantClasses[variant],
        variant === 'typing' && isTyping && "after:content-['|'] after:ml-1 after:animate-pulse",
        className
      )}
      data-text={variant === 'glitch' ? children : undefined}
    >
      {displayText}
      {variant === 'glitch' && (
        <>
          <span className="absolute top-0 left-0 -z-10 text-primary/50 animate-pulse" aria-hidden="true">
            {children}
          </span>
          <span className="absolute top-0 left-0 -z-20 text-accent/50 animate-pulse" style={{ animationDelay: '0.2s' }} aria-hidden="true">
            {children}
          </span>
        </>
      )}
    </Component>
  );
}