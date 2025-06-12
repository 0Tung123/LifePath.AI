"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game-store";
import { useAuthStore } from "@/store/auth-store";

export default function GamePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { characters, fetchCharacters, isLoading, error } = useGameStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const initializeGame = async () => {
      try {
        await fetchCharacters();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    initializeGame();
  }, [isAuthenticated, router, fetchCharacters]);

  const handleCreateCharacter = () => {
    router.push("/game/character-creation");
  };

  const handleSelectCharacter = (characterId: string) => {
    router.push(`/game/play?characterId=${characterId}`);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Adventure Game</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Characters</h2>
        {characters.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-lg mb-4">You don't have any characters yet.</p>
            <button
              onClick={handleCreateCharacter}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition-colors"
            >
              Create Your First Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-xl font-semibold">{character.name}</h3>
                  <p className="text-sm text-gray-600">
                    {character.characterClass} • Level {character.level}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-sm mb-2">
                    <span className="font-medium">Genre:</span>{" "}
                    {character.primaryGenre}
                  </p>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">
                      Key Attributes:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(character.attributes)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="capitalize">{key}:</span> {value}
                          </div>
                        ))}
                    </div>
                  </div>
                  {character.isDead ? (
                    <div className="bg-red-100 text-red-800 p-2 rounded text-center mb-3">
                      Character is deceased
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleSelectCharacter(character.id)}
                      className={`px-4 py-2 rounded ${
                        character.isDead
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/80"
                      }`}
                      disabled={character.isDead}
                    >
                      {character.isDead ? "View Legacy" : "Play"}
                    </button>
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Character Card */}
            <div
              onClick={handleCreateCharacter}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-gray-50 flex flex-col items-center justify-center p-8 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <span className="text-3xl">+</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Create New Character
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Start a new adventure with a fresh character
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
