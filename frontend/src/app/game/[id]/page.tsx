"use client";

import React, { useEffect, useState } from "react";
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
} from "@/services/game.service";
import Header from "@/components/Header";

export default function GamePage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentGame, makeChoice, isLoading: gameLoading } = useGame();
  const router = useRouter();
  const gameId = params.id;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingChoice, setProcessingChoice] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "story" | "stats" | "inventory" | "skills" | "lore"
  >("story");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch game data
  useEffect(() => {
    if (isAuthenticated && gameId) {
      fetchGame();
    }
  }, [isAuthenticated, gameId]);

  const fetchGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGame = await gameService.getGameById(gameId);
      setGame(fetchedGame);
    } catch (err) {
      console.error("Error fetching game:", err);
      setError("Failed to load game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeChoice = async (choiceNumber: number) => {
    if (!game || processingChoice) return;

    setProcessingChoice(true);
    setSelectedChoice(choiceNumber);
    setError(null);

    try {
      // First try using the context method if available
      if (makeChoice) {
        await makeChoice(choiceNumber);
      } else {
        // Fallback to direct API call
        const updatedGame = await gameService.makeChoice(gameId, choiceNumber);
        setGame(updatedGame);
      }
      // Scroll to top after choice is made
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error making choice:", err);
      setError("Failed to process your choice. Please try again.");
    } finally {
      setProcessingChoice(false);
      setSelectedChoice(null);
    }
  };

  if (authLoading || gameLoading || !currentGame) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading adventure...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400">
            {currentGame.settings.characterName}'s Adventure
          </h1>
          <div className="text-gray-400 mt-2">
            {currentGame.settings.theme} • {currentGame.settings.setting}
          </div>
        </header>

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
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === "story" && (
            <>
              <div className="prose prose-invert max-w-none mb-8">
                <div className="whitespace-pre-line">
                  {currentGame.currentPrompt}
                </div>
              </div>

              {currentGame.currentChoices &&
                currentGame.currentChoices.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-amber-400">
                      What will you do?
                    </h3>
                    <div className="space-y-3">
                      {currentGame.currentChoices.map((choice) => (
                        <button
                          key={choice.number}
                          onClick={() => handleMakeChoice(choice.number)}
                          disabled={gameLoading}
                          className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-150"
                        >
                          <span className="font-bold text-amber-400">
                            {choice.number}.
                          </span>{" "}
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </>
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
