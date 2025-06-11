'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  // Khởi tạo theme từ localStorage nếu có
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedFontSize = localStorage.getItem('fontSize') as FontSize;
    
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Mặc định sử dụng chế độ tối
      setThemeState('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      document.documentElement.setAttribute('data-font-size', savedFontSize);
    } else {
      // Mặc định sử dụng cỡ chữ trung bình
      setFontSizeState('medium');
      document.documentElement.setAttribute('data-font-size', 'medium');
    }
  }, []);

  // Hàm cập nhật theme
  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Hàm cập nhật font size
  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook để sử dụng theme trong các component
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}