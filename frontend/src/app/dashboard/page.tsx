"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function Dashboard() {
  const router = useRouter();
  interface User {
    firstName?: string;
    lastName?: string;
    email?: string;
  }

  interface Message {
    role: "user" | "assistant";
    content: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Set default authorization header for all requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        // This endpoint would need to be implemented in your backend
        const response = await api.get("/user/profile");
        setUser(response.data);

        // Mock conversation history for demo
        setConversationHistory([
          { role: "assistant", content: "Hello! How can I assist you today?" },
          { role: "user", content: "Tell me about AI capabilities" },
          {
            role: "assistant",
            content:
              "AI systems like me can help with various tasks including answering questions, generating content, analyzing data, and providing personalized recommendations. What specific aspect of AI are you interested in?",
          },
        ]);
      } catch (error: unknown) {
        console.error("Failed to fetch user profile:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const apiError = error as { response?: { status?: number } };
          if (apiError.response?.status === 401) {
            localStorage.removeItem("token");
            router.push("/auth/login");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const newMessage: Message = { role: "user", content: userInput };
    setConversationHistory([...conversationHistory, newMessage]);
    setUserInput("");
    setIsProcessing(true);

    // Show typing indicator
    setAiMessage("...");

    try {
      // This would be your actual AI API integration
      // For demo, we'll simulate a response
      setTimeout(() => {
        const aiResponses = [
          "I understand you're interested in that topic. Let me provide some insights based on the latest information.",
          "That's a great question! Here's what I know about this subject.",
          "I'd be happy to help with that. Here's some information that might be useful for you.",
          "Based on my knowledge, here are some key points about your question.",
        ];

        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];
        const assistantMessage: Message = {
          role: "assistant",
          content: randomResponse,
        };

        setConversationHistory((prev) => [...prev, assistantMessage]);
        setAiMessage("");
        setIsProcessing(false);
      }, 1500);
    } catch (error: unknown) {
      console.error("Error processing message:", error);
      setAiMessage("");
      setIsProcessing(false);

      // Add error message to conversation
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
      };
      setConversationHistory((prev) => [...prev, errorMessage]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">AI Companion</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => router.push("/game")}
                className="w-full text-left px-4 py-2 rounded-lg flex items-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Play Game
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTab === "overview"
                    ? "bg-blue-900/50 text-blue-400"
                    : "hover:bg-gray-700"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTab === "chat"
                    ? "bg-blue-900/50 text-blue-400"
                    : "hover:bg-gray-700"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  ></path>
                </svg>
                AI Chat
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTab === "profile"
                    ? "bg-blue-900/50 text-blue-400"
                    : "hover:bg-gray-700"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeTab === "settings"
                    ? "bg-blue-900/50 text-blue-400"
                    : "hover:bg-gray-700"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                Settings
              </button>
            </li>
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="ml-3">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "chat" && "AI Assistant"}
            {activeTab === "profile" && "User Profile"}
            {activeTab === "settings" && "Settings"}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardCard
                  title="AI Interactions"
                  value="28"
                  trend="+12% from last week"
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      ></path>
                    </svg>
                  }
                />
                <DashboardCard
                  title="Memory Items"
                  value="156"
                  trend="+24 this month"
                  icon={
                    <svg
                      className="w-6 h-6 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      ></path>
                    </svg>
                  }
                />
                <DashboardCard
                  title="API Requests"
                  value="1,204"
                  trend="87% of monthly limit"
                  icon={
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      ></path>
                    </svg>
                  }
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <ActivityItem
                    title="AI Conversation"
                    description="You had a 15-minute conversation about project planning."
                    time="2 hours ago"
                  />
                  <ActivityItem
                    title="New Memory Created"
                    description="Memory about 'Project Deadlines' was stored."
                    time="Yesterday"
                  />
                  <ActivityItem
                    title="Profile Updated"
                    description="You updated your AI preferences settings."
                    time="3 days ago"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    AI Learning Progress
                  </h3>
                  <div className="space-y-4">
                    <ProgressItem label="Conversation Context" value={85} />
                    <ProgressItem label="Personal Preferences" value={72} />
                    <ProgressItem label="Technical Knowledge" value={94} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ActionButton
                      label="New Chat"
                      onClick={() => setActiveTab("chat")}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Add Memory"
                      onClick={() => alert("Memory feature coming soon!")}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Analytics"
                      onClick={() => alert("Analytics feature coming soon!")}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          ></path>
                        </svg>
                      }
                    />
                    <ActionButton
                      label="Settings"
                      onClick={() => setActiveTab("settings")}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 bg-gray-800 rounded-xl p-4">
                {conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-700 text-white rounded-bl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {aiMessage && (
                  <div className="text-left mb-4">
                    <div className="inline-block px-4 py-2 rounded-lg max-w-[80%] bg-gray-700 text-white rounded-bl-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !userInput.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </button>
              </form>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-400">{user?.email}</p>
                    <p className="text-green-400 mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      Email Verified
                    </p>
                  </div>
                </div>

                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                  Edit Profile
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">First Name</p>
                    <p className="font-medium">
                      {user?.firstName || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Name</p>
                    <p className="font-medium">{user?.lastName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Account Created
                    </p>
                    <p className="font-medium">May 15, 2023</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">AI Preferences</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">AI Memory Retention</p>
                      <p className="text-sm text-gray-400">
                        Allow AI to remember past conversations
                      </p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-blue-500 transform translate-x-6"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Learning Mode</p>
                      <p className="text-sm text-gray-400">
                        Allow AI to learn from your interactions
                      </p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-blue-500 transform translate-x-6"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Data Privacy</p>
                      <p className="text-sm text-gray-400">
                        Anonymize personal data in conversations
                      </p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Account Settings</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white"
                      value={user?.email}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Change Password
                    </label>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                      Update Password
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Language Preference
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white">
                      <option value="en">English (US)</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">AI API Settings</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Gemini API Key
                    </label>
                    <div className="flex">
                      <input
                        type="password"
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-l-lg text-white"
                        value="•••••••••••••••••••••••••"
                        readOnly
                      />
                      <button className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-r-lg text-white">
                        Update
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      Your personal API key is securely stored and never shared.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Model Preference
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white">
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">
                        Gemini Pro Vision
                      </option>
                      <option value="gpt-4">GPT-4 (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Danger Zone</h3>

                <div className="p-4 border border-red-600 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Once you delete your account, there is no going back. All
                    your data will be permanently removed.
                  </p>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface DashboardCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
}

function DashboardCard({ title, value, trend, icon }: DashboardCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-sm text-green-400 mt-1">{trend}</p>
        </div>
        <div className="p-3 bg-gray-700 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start pb-4 border-b border-gray-700">
      <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-4">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <div className="text-gray-500 text-sm">{time}</div>
    </div>
  );
}

interface ProgressItemProps {
  label: string;
  value: number;
}

function ProgressItem({ label, value }: ProgressItemProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

function ActionButton({ label, onClick, icon }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
    >
      <div className="p-2 bg-gray-600 rounded-lg mb-2">{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}
