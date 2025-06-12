"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore, type Quest } from "@/store/game-store";
import AdventureLog from "@/components/game/AdventureLog";
import CharacterStats from "@/components/game/CharacterStats";
import QuestPanel from "@/components/game/QuestPanel";
import GameOverScreen from "@/components/game/GameOverScreen";
import MemoryRecall from "@/components/game/MemoryRecall";
import MobileGameNav from "@/components/game/MobileGameNav";
import GameInputPanel from "@/components/game/GameInputPanel";

export default function GamePlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("characterId");

  const {
    selectedCharacter,
    selectCharacter,
    currentSession,
    startGameSession,
    makeChoice,
    submitCustomInput,
    adventureLog,
    activeQuests,
    fetchQuests,
    isLoading,
    error,
  } = useGameStore();

  // Removed customInput state as we now use the GameInputPanel component
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);

  // Initialize game
  useEffect(() => {
    if (!characterId) {
      router.push("/game");
      return;
    }

    const initializeGame = async () => {
      try {
        // Select character
        await selectCharacter(characterId);

        // Start game session if not already started
        if (!currentSession) {
          await startGameSession(characterId);
          await fetchQuests();
        }
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    initializeGame();
  }, [
    characterId,
    router,
    selectCharacter,
    startGameSession,
    currentSession,
    fetchQuests,
  ]);

  const handleChoiceClick = async (choiceId: string) => {
    try {
      await makeChoice(choiceId);
    } catch (error) {
      console.error("Failed to make choice:", error);
    }
  };

  const handleActionSubmit = async (content: string) => {
    try {
      await submitCustomInput("action", content);
    } catch (error) {
      console.error("Failed to submit action:", error);
    }
  };

  const handleThoughtSubmit = async (content: string) => {
    try {
      await submitCustomInput("thought", content);
    } catch (error) {
      console.error("Failed to submit thought:", error);
    }
  };

  const handleCommunicationSubmit = async (content: string) => {
    try {
      await submitCustomInput("communication", content);
    } catch (error) {
      console.error("Failed to submit communication:", error);
    }
  };

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowQuestModal(true);
  };

  const closeQuestModal = () => {
    setShowQuestModal(false);
    setSelectedQuest(null);
  };

  // Check if character is dead
  const isCharacterDead = currentSession?.character?.isDead || false;

  if (!characterId) {
    return null; // Will redirect to game page
  }

  if (isLoading && !currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show game over screen if character is dead
  if (isCharacterDead && currentSession) {
    return (
      <GameOverScreen
        characterId={characterId}
        characterName={currentSession.character?.name || "Unknown"}
        deathReason={currentSession.deathReason || "Unknown causes"}
        // legacyId is optional in GameOverScreen props
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Game Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              {selectedCharacter?.name || "Adventure"}
            </h1>
            <p className="text-sm text-gray-300">
              {selectedCharacter?.characterClass} • Level{" "}
              {selectedCharacter?.level || 1}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {currentSession && (
              <MemoryRecall gameSessionId={currentSession.id} />
            )}
            <button
              onClick={() => router.push("/game")}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Exit Game
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Character & Quest Info */}
        <div className="w-64 bg-gray-100 border-r overflow-y-auto hidden md:block">
          {/* Character Info */}
          {selectedCharacter && (
            <CharacterStats character={selectedCharacter} />
          )}

          {/* Quest Log */}
          <QuestPanel
            activeQuests={activeQuests}
            onQuestClick={handleQuestClick}
          />
        </div>

        {/* Main Content - Adventure Log */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Adventure Log */}
          <AdventureLog entries={adventureLog} isLoading={isLoading} />

          {/* Choices or Input */}
          {currentSession?.currentStoryNode?.choices &&
          currentSession.currentStoryNode.choices.length > 0 ? (
            <div className="border-t p-4 bg-gray-50">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Choose your action:</h3>
                {currentSession.currentStoryNode.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceClick(choice.id)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 mb-2"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <GameInputPanel
              onSubmitAction={handleActionSubmit}
              onSubmitThought={handleThoughtSubmit}
              onSubmitCommunication={handleCommunicationSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>

      {/* Quest Detail Modal */}
      {showQuestModal && selectedQuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2">{selectedQuest.title}</h2>
            <div className="flex items-center mb-4">
              <span
                className={`px-2 py-1 text-xs rounded ${
                  selectedQuest.type === "main"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {selectedQuest.type === "main" ? "Main Quest" : "Side Quest"}
              </span>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded ${
                  selectedQuest.status === "active"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedQuest.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedQuest.status.charAt(0).toUpperCase() +
                  selectedQuest.status.slice(1)}
              </span>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-gray-700">{selectedQuest.description}</p>
            </div>

            {selectedQuest.completionCriteria && (
              <div className="mb-4">
                <h3 className="font-medium mb-1">Objectives</h3>
                <p className="text-gray-700">
                  {selectedQuest.completionCriteria}
                </p>
              </div>
            )}

            {selectedQuest.rewards && (
              <div className="mb-4">
                <h3 className="font-medium mb-1">Rewards</h3>
                <ul className="text-sm text-gray-700">
                  {selectedQuest.rewards.experience && (
                    <li>Experience: {selectedQuest.rewards.experience} XP</li>
                  )}
                  {selectedQuest.rewards.gold && (
                    <li>Gold: {selectedQuest.rewards.gold}</li>
                  )}
                  {selectedQuest.rewards.items &&
                    selectedQuest.rewards.items.map((item, index) => (
                      <li key={index}>Item: {item}</li>
                    ))}
                  {selectedQuest.rewards.other && (
                    <li>Other: {selectedQuest.rewards.other}</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={closeQuestModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileGameNav
        character={selectedCharacter}
        activeQuests={activeQuests}
        onQuestClick={handleQuestClick}
      />
    </div>
  );
}
