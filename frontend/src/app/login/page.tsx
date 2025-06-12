'use client';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full filter blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
        
        {/* Digital circuit lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M10 10 H 90 V 90 H 170 V 170 H 90 V 90 H 10 V 10" stroke="rgb(var(--primary))" strokeWidth="1" fill="none" />
              <circle cx="10" cy="10" r="3" fill="rgb(var(--primary))" />
              <circle cx="90" cy="90" r="3" fill="rgb(var(--primary))" />
              <circle cx="170" cy="170" r="3" fill="rgb(var(--primary))" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>
      
      {/* Animated logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary opacity-20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-2 border-primary opacity-40 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full border-2 border-primary opacity-60"></div>
          <div className="absolute inset-6 rounded-full bg-primary opacity-80"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold">AI</div>
        </div>
      </div>
      
      <LoginForm />
    </div>
  );
}