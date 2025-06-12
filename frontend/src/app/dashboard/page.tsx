"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { MainLayout } from "@/components/layout/main-layout";
import { AIContainer } from "@/components/ui/ai-container";
import { AIText } from "@/components/ui/ai-text";
import { AICard } from "@/components/ui/ai-card";
import { AIButton } from "@/components/ui/ai-button";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState("Initializing...");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

    // Simulate system status updates
    const statusMessages = [
      "Initializing AI narrative engine...",
      "Loading character profiles...",
      "Analyzing story patterns...",
      "Generating narrative possibilities...",
      "System ready",
    ];

    let currentIndex = 0;
    const statusInterval = setInterval(() => {
      setSystemStatus(statusMessages[currentIndex]);
      currentIndex++;
      if (currentIndex >= statusMessages.length) {
        clearInterval(statusInterval);
      }
    }, 1000);

    return () => clearInterval(statusInterval);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Mock data for AI stories
  const stories = [
    {
      id: 1,
      title: "Hành trình vào lòng đất",
      description:
        "Khám phá thế giới bí ẩn dưới lòng đất với AI guide thông minh.",
      progress: 35,
      characters: 3,
      lastActive: "2 giờ trước",
    },
    {
      id: 2,
      title: "Vũ trụ song song",
      description:
        "Cuộc phiêu lưu xuyên không gian với các nhân vật AI có khả năng học hỏi.",
      progress: 68,
      characters: 5,
      lastActive: "1 ngày trước",
    },
    {
      id: 3,
      title: "Thành phố tương lai",
      description: "Khám phá thành phố năm 2150 với các AI có ý thức riêng.",
      progress: 12,
      characters: 7,
      lastActive: "3 giờ trước",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

        {/* Glowing orb */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] opacity-30 animate-pulse"></div>

        {/* Digital circuit lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="circuit-pattern"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10 10 H 90 V 90 H 170 V 170 H 90 V 90 H 10 V 10"
                stroke="rgb(var(--primary))"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="10" cy="10" r="3" fill="rgb(var(--primary))" />
              <circle cx="90" cy="90" r="3" fill="rgb(var(--primary))" />
              <circle cx="170" cy="170" r="3" fill="rgb(var(--primary))" />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#circuit-pattern)"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar */}
          <div className="lg:w-1/4">
            <AIContainer variant="glass" className="sticky top-24">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-medium text-primary">
                      {user?.firstName?.[0] || ""}
                      {user?.lastName?.[0] || ""}
                    </span>
                  )}
                </div>
                <div>
                  <AIText
                    variant="gradient"
                    as="h2"
                    className="text-xl font-bold"
                  >
                    {`${user?.firstName || ""} ${user?.lastName || ""}`}
                  </AIText>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Trạng thái hệ thống
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                  <AIText
                    variant="typing"
                    className="text-xs text-primary"
                    delay={500}
                    speed={20}
                  >
                    {systemStatus}
                  </AIText>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    ĐIỀU HƯỚNG
                  </h3>
                  <nav className="space-y-1">
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm rounded-md bg-primary/10 text-primary"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-primary/5"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Thư viện truyện
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-primary/5"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Nhân vật AI
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-primary/5"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Cài đặt
                    </a>
                  </nav>
                </div>
              </div>
            </AIContainer>
          </div>

          {/* Main content */}
          <div className="lg:w-3/4 space-y-8">
            <AIContainer variant="glass">
              <div className="flex justify-between items-center mb-6">
                <AIText
                  variant="gradient"
                  as="h1"
                  className="text-2xl font-bold"
                >
                  AI Narrative Dashboard
                </AIText>
                <AIButton variant="gradient" size="sm">
                  Tạo truyện mới
                </AIButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <AICard variant="hover" glowing className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Truyện đang hoạt động
                    </div>
                  </div>
                </AICard>

                <AICard variant="hover" glowing className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      15
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Nhân vật AI
                    </div>
                  </div>
                </AICard>

                <AICard variant="hover" glowing className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      42%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tiến độ trung bình
                    </div>
                  </div>
                </AICard>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Truyện của bạn</h2>
                  <div className="text-sm text-muted-foreground">
                    Tổng số: {stories.length}
                  </div>
                </div>

                <div className="space-y-4">
                  {stories.map((story) => (
                    <AICard
                      key={story.id}
                      variant={activeStory === story.id ? "gradient" : "hover"}
                      glowing={activeStory === story.id}
                      hoverable
                      className="p-5 cursor-pointer transition-all duration-300"
                      onClick={() =>
                        setActiveStory(
                          story.id === activeStory ? null : story.id
                        )
                      }
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <AIText
                            variant={
                              activeStory === story.id ? "neon" : "default"
                            }
                            as="h3"
                            className="text-lg font-medium mb-1"
                          >
                            {story.title}
                          </AIText>
                          <p className="text-sm text-muted-foreground mb-2">
                            {story.description}
                          </p>

                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <svg
                                className="h-3 w-3 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {story.lastActive}
                            </span>
                            <span className="flex items-center">
                              <svg
                                className="h-3 w-3 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {story.characters} nhân vật
                            </span>
                          </div>
                        </div>

                        <div className="w-full md:w-32">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${story.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-xs font-medium">
                              {story.progress}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <AIButton variant="outline" size="sm">
                            Tiếp tục
                          </AIButton>
                        </div>
                      </div>

                      {activeStory === story.id && (
                        <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                NHÂN VẬT GẦN ĐÂY
                              </h4>
                              <div className="flex -space-x-2">
                                {Array.from({ length: story.characters }).map(
                                  (_, i) => (
                                    <div
                                      key={i}
                                      className="w-8 h-8 rounded-full bg-primary/20 border border-[rgb(var(--border))] flex items-center justify-center text-xs"
                                    >
                                      {String.fromCharCode(65 + i)}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                CHƯƠNG TIẾP THEO
                              </h4>
                              <p className="text-sm">
                                Khám phá hang động bí ẩn
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                HOẠT ĐỘNG
                              </h4>
                              <div className="text-sm">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                Nhân vật đang hoạt động
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end mt-4 space-x-2">
                            <AIButton variant="outline" size="sm">
                              Chỉnh sửa
                            </AIButton>
                            <AIButton variant="gradient" size="sm">
                              Tiếp tục truyện
                            </AIButton>
                          </div>
                        </div>
                      )}
                    </AICard>
                  ))}
                </div>
              </div>
            </AIContainer>

            <AIContainer variant="terminal" glowing>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex">
                  <span className="text-muted-foreground mr-2">&gt;</span>
                  <AIText variant="typing" delay={500} speed={20}>
                    AI Narrative System v2.4.7
                  </AIText>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">&gt;</span>
                  <AIText variant="typing" delay={1500} speed={20}>
                    Neural networks initialized
                  </AIText>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">&gt;</span>
                  <AIText variant="typing" delay={2500} speed={20}>
                    Character development module: ACTIVE
                  </AIText>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">&gt;</span>
                  <AIText variant="typing" delay={3500} speed={20}>
                    Story generation engine: READY
                  </AIText>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground mr-2">&gt;</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </AIContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
