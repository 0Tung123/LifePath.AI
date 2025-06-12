'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { MainLayout } from '@/components/layout/main-layout';
import { AIButton } from '@/components/ui/ai-button';
import { AIText } from '@/components/ui/ai-text';
import { AIContainer } from '@/components/ui/ai-container';
import { AICard } from '@/components/ui/ai-card';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
    
    // Simulate typing completion
    const timer = setTimeout(() => {
      setTypingComplete(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <AIText variant="typing" className="text-lg text-primary">
            Khởi động hệ thống...
          </AIText>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[120px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
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
      
      {/* Header */}
      <header className="relative z-10 pt-6 px-4 sm:px-6 lg:px-8">
        <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start">
          <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
            <div className="flex items-center justify-between w-full md:w-auto">
              <Link href="/" className="flex items-center">
                <div className="relative w-10 h-10 mr-2">
                  <div className="absolute inset-0 rounded-full border-2 border-primary opacity-60"></div>
                  <div className="absolute inset-2 rounded-full bg-primary opacity-80"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-bold text-xs">AI</div>
                </div>
                <AIText variant="gradient" className="text-xl font-bold">
                  AI Narrative
                </AIText>
              </Link>
            </div>
          </div>
          <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
            <Link href="/login" className="ai-text text-primary hover:text-primary/80">
              Đăng nhập
            </Link>
            <Link href="/signup" className="ai-text text-primary hover:text-primary/80">
              Đăng ký
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <AIContainer variant="glass" className="p-8 backdrop-blur-md">
                  <AIText variant="typing" as="h1" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl" delay={300} speed={40}>
                    Khám phá thế giới AI Narrative
                  </AIText>
                  
                  <div className={`mt-6 transition-opacity duration-500 ${typingComplete ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-base text-foreground/80 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Hệ thống AI tiên tiến cho phép bạn tạo ra và trải nghiệm các cốt truyện phức tạp, 
                      với các nhân vật AI có khả năng tương tác và phát triển theo thời gian thực.
                    </p>
                    
                    <div className="mt-8 sm:mt-12">
                      <div className="rounded-md shadow">
                        <Link href="/signup">
                          <AIButton variant="gradient" glow className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                            Bắt đầu hành trình
                          </AIButton>
                        </Link>
                      </div>
                      <div className="mt-3">
                        <Link href="/login">
                          <AIButton variant="outline" className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                            Tiếp tục hành trình
                          </AIButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </AIContainer>
              </div>
              
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <AIContainer variant="terminal" glowing className="relative block w-full h-full overflow-hidden">
                    <div className="pt-4">
                      <div className="space-y-2 font-mono text-sm text-primary">
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <AIText variant="typing" delay={1500} speed={20}>
                            Initializing AI Narrative System...
                          </AIText>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <AIText variant="typing" delay={3000} speed={20}>
                            Loading neural networks...
                          </AIText>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <AIText variant="typing" delay={4500} speed={20}>
                            Generating story patterns...
                          </AIText>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <AIText variant="typing" delay={6000} speed={20}>
                            Character development module active...
                          </AIText>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <AIText variant="typing" delay={7500} speed={20}>
                            System ready. Awaiting user input...
                          </AIText>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground mr-2">&gt;</span>
                          <span className="animate-pulse">_</span>
                        </div>
                      </div>
                    </div>
                  </AIContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-16 bg-background/50 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AIText variant="gradient" as="h2" className="text-base font-semibold tracking-wide uppercase">
                Tính năng
              </AIText>
              <p className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Trải nghiệm cốt truyện AI tiên tiến
              </p>
              <p className="mt-4 max-w-2xl text-xl text-foreground/70 lg:mx-auto">
                Khám phá các tính năng độc đáo mà hệ thống AI Narrative cung cấp.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Nhân vật AI thông minh
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Tương tác với các nhân vật AI có khả năng học hỏi, thích nghi và phát triển dựa trên hành động của bạn.
                      </p>
                    </div>
                  </div>
                </AICard>

                {/* Feature 2 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Cốt truyện động
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Mỗi quyết định của bạn sẽ ảnh hưởng đến diễn biến câu chuyện, tạo ra trải nghiệm độc đáo cho mỗi người dùng.
                      </p>
                    </div>
                  </div>
                </AICard>

                {/* Feature 3 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Tạo cốt truyện
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Tự tạo và chia sẻ cốt truyện của riêng bạn với công cụ biên tập trực quan và dễ sử dụng.
                      </p>
                    </div>
                  </div>
                </AICard>

                {/* Feature 4 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Thông báo thời gian thực
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Nhận thông báo khi nhân vật AI phát triển hoặc khi có sự kiện mới trong cốt truyện của bạn.
                      </p>
                    </div>
                  </div>
                </AICard>

                {/* Feature 5 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Cộng đồng tương tác
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Tham gia cộng đồng người dùng, chia sẻ cốt truyện và trải nghiệm với những người khác.
                      </p>
                    </div>
                  </div>
                </AICard>

                {/* Feature 6 */}
                <AICard variant="hover" glowing hoverable className="p-6">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-16">
                      <AIText variant="gradient" as="h3" className="text-lg font-medium">
                        Bảo mật dữ liệu
                      </AIText>
                      <p className="mt-2 text-base text-foreground/70">
                        Dữ liệu của bạn được mã hóa và bảo vệ, đảm bảo trải nghiệm an toàn và riêng tư.
                      </p>
                    </div>
                  </div>
                </AICard>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              <span className="block">Sẵn sàng để bắt đầu?</span>
              <AIText variant="gradient" className="block text-2xl sm:text-3xl">
                Tham gia hành trình AI Narrative ngay hôm nay.
              </AIText>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link href="/signup">
                  <AIButton variant="gradient" glow className="px-5 py-3">
                    Đăng ký
                  </AIButton>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link href="/login">
                  <AIButton variant="outline" className="px-5 py-3">
                    Đăng nhập
                  </AIButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-border pt-8 flex flex-col items-center">
            <AIText variant="gradient" className="text-2xl font-bold">
              AI Narrative
            </AIText>
            <p className="mt-2 text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} AI Narrative. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-foreground/60 hover:text-primary">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary">
                Liên hệ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}