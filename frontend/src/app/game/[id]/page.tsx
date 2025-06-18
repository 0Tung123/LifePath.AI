"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { KnowledgeBaseItem } from "@/services/game.service";
import Header from "@/components/Header";

// Import GameplayScreen components
import CharacterStatsPanel from "@/components/GameplayScreen/CharacterStatsPanel";
import CurrentObjectivePanel from "@/components/GameplayScreen/CurrentObjectivePanel";
import StoryHistoryPanel from "@/components/GameplayScreen/StoryHistoryPanel";
import InventoryPanel from "@/components/GameplayScreen/InventoryPanel";
import SkillsPanel from "@/components/GameplayScreen/SkillsPanel";
import LorePanel from "@/components/GameplayScreen/LorePanel";
import ActionInputPanel from "@/components/GameplayScreen/ActionInputPanel";

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    currentGame,
    loadGame,
    makeChoice,
    performAction,
    performThinking,
    performCommunication,
    getSummary,
    isLoading: gameLoading,
    error: gameError,
    clearError,
  } = useGame();
  const router = useRouter();
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [selectedLoreItem, setSelectedLoreItem] =
    useState<KnowledgeBaseItem | null>(null);
  const [summaryText, setSummaryText] = useState<string>("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

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

  // Action handlers
  const handleMakeChoice = async (choiceNumber: number) => {
    setError(null);
    clearError();
    try {
      await makeChoice(choiceNumber);
    } catch (err) {
      console.error("Error making choice:", err);
      setError("Failed to process your choice. Please try again.");
    }
  };

  const handlePerformAction = async (action: string) => {
    setError(null);
    clearError();
    try {
      await performAction(action);
    } catch (err) {
      console.error("Error performing action:", err);
      setError("Failed to process your action. Please try again.");
    }
  };

  const handlePerformThinking = async (think: string) => {
    setError(null);
    clearError();
    try {
      await performThinking(think);
    } catch (err) {
      console.error("Error performing thinking:", err);
      setError("Failed to process your thinking. Please try again.");
    }
  };

  const handlePerformCommunication = async (communication: string) => {
    setError(null);
    clearError();
    try {
      await performCommunication(communication);
    } catch (err) {
      console.error("Error performing communication:", err);
      setError("Failed to process your communication. Please try again.");
    }
  };

  const handleGetSummary = async () => {
    setError(null);
    clearError();
    try {
      const summary = await getSummary();
      setSummaryText(summary);
      setShowSummaryModal(true);
    } catch (err) {
      console.error("Error getting summary:", err);
      setError("Failed to get summary. Please try again.");
    }
  };

  // Lore handlers
  const handleLoreClick = (item: KnowledgeBaseItem) => {
    setSelectedLoreItem(item);
  };

  const handleCloseLoreDetail = () => {
    setSelectedLoreItem(null);
  };

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setSummaryText("");
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
              <div
                className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="text-xl font-semibold">
              Loading your adventure...
            </span>
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
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Adventure Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              The adventure you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
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

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-purple-400 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Tóm Tắt Câu Chuyện AI
              </h4>
              <button
                onClick={handleCloseSummaryModal}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                {summaryText}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Game Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-400">
                {currentGame.settings.characterName}&apos;s Adventure
              </h1>
              <div className="text-gray-400 mt-2">
                {currentGame.settings.theme} • {currentGame.settings.setting}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {currentGame.storyHistory ? currentGame.storyHistory.length : 0}{" "}
                chapters written
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(currentGame.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {displayError && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{displayError}</span>
            </div>
          </div>
        )}

        {/* Current Objective Panel */}
        {currentGame.currentObjective && (
          <div className="mb-6">
            <CurrentObjectivePanel
              currentObjective={currentGame.currentObjective}
            />
          </div>
        )}

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Character Info */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            <CharacterStatsPanel characterStats={currentGame.characterStats} />
            <InventoryPanel inventoryItems={currentGame.inventoryItems} />
            <SkillsPanel characterSkills={currentGame.characterSkills} />
          </div>

          {/* Center - Story History */}
          <div className="lg:col-span-2">
            <StoryHistoryPanel
              storyHistory={currentGame.storyHistory}
              knowledgeBase={currentGame.knowledgeBase}
              onLoreClick={handleLoreClick}
            />
          </div>

          {/* Right Sidebar - Lore & Actions */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            <LorePanel
              loreFragments={currentGame.loreFragments}
              knowledgeBase={currentGame.knowledgeBase}
              selectedLoreItem={selectedLoreItem}
              onCloseLoreDetail={handleCloseLoreDetail}
            />
          </div>
        </div>

        {/* Bottom Action Panel */}
        <div className="mt-6">
          <ActionInputPanel
            currentChoices={currentGame.currentChoices}
            isLoading={gameLoading}
            onMakeChoice={handleMakeChoice}
            onPerformAction={handlePerformAction}
            onPerformThinking={handlePerformThinking}
            onPerformCommunication={handlePerformCommunication}
            onGetSummary={handleGetSummary}
          />
        </div>
      </div>
    </div>
  );
}
