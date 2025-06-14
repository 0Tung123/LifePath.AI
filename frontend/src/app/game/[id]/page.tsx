"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import gameService, {
  Game,
  Choice,
  InventoryItem,
  Skill,
  GameStats,
  LoreFragment,
  StorySegment,
} from "@/services/game.service";
import Header from "@/components/Header";

export default function GamePage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentGame, loadGame, makeChoice, isLoading: gameLoading, error: gameError, clearError } = useGame();
  const router = useRouter();
  const gameId = params.id;

  const [error, setError] = useState<string | null>(null);
  const [processingChoice, setProcessingChoice] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const storyEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<
    "story" | "stats" | "inventory" | "skills" | "lore"
  >("story");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load game data using context
  useEffect(() => {
    if (isAuthenticated && gameId) {
      loadGame(gameId).catch((err) => {
        console.error("Error loading game:", err);
        setError("Failed to load game. Please try again.");
      });
    }
  }, [isAuthenticated, gameId, loadGame]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setError(null);
  }, [clearError]);

  // Scroll utilities
  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    storyContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle scroll events to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (storyContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = storyContainerRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        setShowScrollToTop(scrollTop > 300 && !isNearBottom);
      }
    };

    const container = storyContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Auto-scroll to bottom when new story content is added
  useEffect(() => {
    if (currentGame && !processingChoice) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [currentGame?.storyHistory?.length, currentGame?.currentPrompt, processingChoice]);

  const handleMakeChoice = async (choiceNumber: number) => {
    if (!currentGame || processingChoice) return;

    setProcessingChoice(true);
    setSelectedChoice(choiceNumber);
    setError(null);
    clearError();

    try {
      await makeChoice(choiceNumber);
    } catch (err) {
      console.error("Error making choice:", err);
      setError("Failed to process your choice. Please try again.");
    } finally {
      setProcessingChoice(false);
      setSelectedChoice(null);
    }
  };

  // Format timestamp for story segments
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Export story function
  const exportStory = () => {
    if (!currentGame) return;
    
    let storyText = `${currentGame.settings.characterName}'s Adventure\n`;
    storyText += `Theme: ${currentGame.settings.theme}\n`;
    storyText += `Setting: ${currentGame.settings.setting}\n`;
    storyText += `Character Backstory: ${currentGame.settings.characterBackstory}\n\n`;
    storyText += "=".repeat(50) + "\n\n";
    
    // Add story history
    if (currentGame.storyHistory) {
      currentGame.storyHistory.forEach((segment, index) => {
        storyText += `Chapter ${index + 1}\n`;
        storyText += `${new Date(segment.timestamp).toLocaleString()}\n`;
        storyText += "-".repeat(30) + "\n";
        storyText += `${segment.text}\n\n`;
      });
    }
    
    // Add current story
    if (currentGame.currentPrompt) {
      storyText += `Current Chapter\n`;
      storyText += `${new Date().toLocaleString()}\n`;
      storyText += "-".repeat(30) + "\n";
      storyText += `${currentGame.currentPrompt}\n\n`;
    }
    
    // Create and download file
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentGame.settings.characterName}_Adventure.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Combine errors
  const displayError = error || gameError;

  if (authLoading || gameLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 text-amber-400">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xl font-semibold">Loading your adventure...</span>
          </div>
          <p className="mt-2 text-gray-400">Preparing the threads of fate...</p>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Adventure Not Found</h1>
            <p className="text-gray-400 mb-6">The adventure you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 focus:outline-none"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-400">
                {currentGame.settings.characterName}'s Adventure
              </h1>
              <div className="text-gray-400 mt-2">
                {currentGame.settings.theme} • {currentGame.settings.setting}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={exportStory}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm rounded-md transition-colors flex items-center space-x-2"
                  title="Export story as text file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>
              </div>
              <div className="text-sm text-gray-400">
                {currentGame.storyHistory ? currentGame.storyHistory.length : 0} chapters written
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {formatTimestamp(currentGame.updatedAt)}
              </div>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {displayError && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{displayError}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("story")}
              className={`py-2 px-4 font-medium ${
                activeTab === "story"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-2 px-4 font-medium ${
                activeTab === "stats"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`py-2 px-4 font-medium ${
                activeTab === "inventory"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`py-2 px-4 font-medium ${
                activeTab === "skills"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab("lore")}
              className={`py-2 px-4 font-medium ${
                activeTab === "lore"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Lore
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {activeTab === "story" && (
            <div className="relative h-[70vh] flex flex-col">
              {/* Story Timeline Container */}
              <div 
                ref={storyContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth story-timeline-scroll"
              >
                {/* Story History Timeline */}
                {currentGame.storyHistory && currentGame.storyHistory.length > 0 && (
                  <div className="space-y-8">
                    {currentGame.storyHistory.map((segment: StorySegment, index: number) => (
                      <div key={index} className="relative story-segment">
                        {/* Timeline Line */}
                        {index < currentGame.storyHistory.length - 1 && (
                          <div className="absolute left-4 top-12 w-0.5 h-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-30 timeline-line"></div>
                        )}
                        
                        {/* Timeline Dot */}
                        <div className="absolute left-2 top-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-gray-800 shadow-lg"></div>
                        
                        {/* Story Content */}
                        <div className="ml-10 bg-gray-700/50 rounded-lg p-4 border border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-amber-300 font-medium">
                              Chapter {index + 1}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(segment.timestamp)}
                            </span>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div className="whitespace-pre-line text-gray-100 leading-relaxed">
                              {segment.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current Story Segment */}
                {currentGame.currentPrompt && (
                  <div className="relative">
                    {/* Timeline Line for current segment */}
                    {currentGame.storyHistory && currentGame.storyHistory.length > 0 && (
                      <div className="absolute left-4 top-0 w-0.5 h-12 bg-gradient-to-b from-amber-600 to-amber-400 opacity-50"></div>
                    )}
                    
                    {/* Pulsing Timeline Dot for current segment */}
                    <div className="absolute left-2 top-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-gray-800 shadow-lg timeline-dot-pulse"></div>
                    
                    {/* Current Story Content */}
                    <div className="ml-10 bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-lg p-4 border border-amber-400/30 backdrop-blur-sm shadow-lg current-story-glow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-amber-300 font-medium flex items-center">
                          <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                          Current Chapter
                        </span>
                        <span className="text-xs text-gray-400">Now</span>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-100 leading-relaxed">
                          {currentGame.currentPrompt}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Thinking Indicator */}
                {processingChoice && (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 w-0.5 h-12 bg-gradient-to-b from-amber-400 to-blue-400 opacity-50"></div>
                    
                    {/* Animated Timeline Dot */}
                    <div className="absolute left-2 top-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-gray-800 shadow-lg">
                      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    
                    {/* AI Thinking Content */}
                    <div className="ml-10 bg-gradient-to-br from-blue-900/20 to-purple-800/10 rounded-lg p-4 border border-blue-400/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-blue-300 text-sm font-medium">
                          The Fates are weaving your destiny...
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Processing your choice: <span className="text-amber-300">Option {selectedChoice}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={storyEndRef}></div>
              </div>

              {/* Fixed Action Panel */}
              <div className="border-t border-gray-700 bg-gray-800/95 backdrop-blur-sm p-6">
                {currentGame.currentChoices && currentGame.currentChoices.length > 0 && !processingChoice && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-amber-400 flex items-center">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"></span>
                      What will you do?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentGame.currentChoices.map((choice) => (
                        <button
                          key={choice.number}
                          onClick={() => handleMakeChoice(choice.number)}
                          disabled={processingChoice}
                          className="group relative text-left p-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-amber-900/30 hover:to-amber-800/20 rounded-lg transition-all duration-200 border border-gray-600 hover:border-amber-400/50 transform hover:scale-[1.02] hover:shadow-lg"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-400 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-amber-300 transition-colors">
                              {choice.number}
                            </span>
                            <span className="text-gray-100 group-hover:text-white transition-colors leading-relaxed">
                              {choice.text}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/5 group-hover:to-amber-400/10 rounded-lg transition-all duration-200"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {processingChoice && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center space-x-3 text-blue-300 mb-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="font-medium">Awaiting the threads of fate...</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">The AI is crafting your next chapter...</p>
                  </div>
                )}
              </div>

              {/* Scroll to Top Button */}
              {showScrollToTop && (
                <button
                  onClick={scrollToTop}
                  className="fixed bottom-6 right-6 w-12 h-12 bg-amber-400 hover:bg-amber-300 text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-10 transform hover:scale-110"
                  aria-label="Scroll to top"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-amber-400">
                Character Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentGame.characterStats).map(
                  ([key, value]) => (
                    <div key={key} className="bg-gray-700 p-4 rounded-lg">
                      <div className="font-medium text-gray-300">{key}</div>
                      <div className="text-xl font-semibold mt-1">{value}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-amber-400">
                Inventory
              </h2>
              {currentGame.inventoryItems.length === 0 ? (
                <p className="text-gray-400">Your inventory is empty.</p>
              ) : (
                <div className="space-y-4">
                  {currentGame.inventoryItems.map(
                    (item: InventoryItem, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          {item.quantity > 1 && (
                            <span className="text-amber-400">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-2 text-gray-300">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-amber-400">
                Skills & Abilities
              </h2>
              {currentGame.characterSkills.length === 0 ? (
                <p className="text-gray-400">
                  You have not learned any skills yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {currentGame.characterSkills.map((skill: Skill, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">{skill.name}</h3>
                        {skill.mastery && (
                          <span className="text-amber-400">
                            {skill.mastery}
                          </span>
                        )}
                        {skill.level && (
                          <span className="text-amber-400">
                            Level {skill.level}
                          </span>
                        )}
                      </div>
                      {skill.description && (
                        <p className="mt-2 text-gray-300">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "lore" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-amber-400">
                Lore & Knowledge
              </h2>
              {currentGame.loreFragments.length === 0 ? (
                <p className="text-gray-400">
                  You have not discovered any lore yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {currentGame.loreFragments.map(
                    (lore: LoreFragment, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs rounded bg-gray-600 text-gray-300">
                            {lore.type}
                          </span>
                          <h3 className="text-lg font-medium">
                            {lore.title || lore.name}
                          </h3>
                        </div>
                        <p className="text-gray-300">
                          {lore.content || lore.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
