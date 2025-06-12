"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game-store";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/api";
import { initializeAuthToken } from "@/utils/auth-token";

export default function GamePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { characters, fetchCharacters, isLoading, error } = useGameStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Track page loads for debugging
    console.log("🎮 [GAME-PAGE-LOAD] Game page loaded", {
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
    
    if (!isAuthenticated) {
      // Try to initialize token from localStorage
      const hasToken = initializeAuthToken();
      
      if (!hasToken) {
        console.log("🔒 [GAME-AUTH-MISSING] No authentication found, redirecting to login", {
          timestamp: new Date().toISOString()
        });
        router.push("/login?redirect=game");
        return;
      } else {
        console.log("🔄 [GAME-AUTH-RESTORE] Token found in localStorage, attempting to restore session", {
          timestamp: new Date().toISOString()
        });
        // Token exists in localStorage but not in auth store
        // ApiInitializer will handle session restoration
      }
    }

    const initializeGame = async () => {
      try {
        console.log("🎮 [GAME-INIT-START] Initializing game data", {
          timestamp: new Date().toISOString()
        });
        
        // Double check token is set in API headers
        const { token } = useAuthStore.getState();
        if (token) {
          console.log("🔑 [GAME-TOKEN-STORE] Using token from auth store", {
            tokenFirstChars: token.substring(0, 10) + '...',
            timestamp: new Date().toISOString()
          });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          // Try to use token from localStorage as fallback
          const hasToken = initializeAuthToken();
          if (!hasToken) {
            console.error("❌ [GAME-TOKEN-MISSING] No token available", {
              timestamp: new Date().toISOString()
            });
            router.push("/login?redirect=game");
            return;
          }
        }

        // Fetch character data
        console.log("👤 [GAME-FETCH-CHARS] Fetching characters", {
          timestamp: new Date().toISOString()
        });
        await fetchCharacters();
        setIsInitialized(true);
        console.log("✅ [GAME-INIT-SUCCESS] Game initialized successfully", {
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("❌ [GAME-INIT-ERROR] Failed to initialize game:", error);
        
        // Handle specific error cases
        if (error.response) {
          const status = error.response.status;
          
          if (status === 401) {
            console.error("❌ [GAME-AUTH-401] Unauthorized access", {
              url: error.config?.url,
              method: error.config?.method,
              timestamp: new Date().toISOString()
            });
            const { logout } = useAuthStore.getState();
            logout();
            router.push("/login?expired=true&redirect=game");
          } else if (status === 403) {
            console.error("❌ [GAME-AUTH-403] Forbidden access", {
              url: error.config?.url,
              timestamp: new Date().toISOString()
            });
            router.push("/dashboard?error=forbidden");
          } else {
            console.error(`❌ [GAME-API-ERROR-${status}] API error`, {
              status,
              data: error.response.data,
              url: error.config?.url,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          console.error("❌ [GAME-NETWORK-ERROR] Network or other error", {
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    // Small delay to allow ApiInitializer to restore session if needed
    console.log("⏱️ [GAME-INIT-DELAY] Setting delay for game initialization", {
      delayMs: 100,
      timestamp: new Date().toISOString()
    });
    
    const timer = setTimeout(() => {
      initializeGame();
    }, 100);
    
    return () => clearTimeout(timer);
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
      <h1 className="text-3xl font-bold mb-6 text-gradient">AI Adventure Game</h1>

      {error && (
        <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 neon-text">Your Characters</h2>
        {characters.length === 0 ? (
          <div className="glass p-6 rounded-lg text-center border border-muted">
            <p className="text-lg mb-4 text-foreground">You don't have any characters yet.</p>
            <button
              onClick={handleCreateCharacter}
              className="btn-ai"
            >
              Create Your First Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className="ai-card p-0"
              >
                <div className="p-4 border-b border-muted bg-card/80">
                  <h3 className="text-xl font-semibold text-foreground">{character.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {character.characterClass} • Level {character.level}
                  </p>
                </div>
                <div className="p-4 bg-card">
                  <p className="text-sm mb-2 text-foreground">
                    <span className="font-medium text-primary">Genre:</span>{" "}
                    {character.primaryGenre}
                  </p>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1 text-foreground">
                      Key Attributes:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                      {Object.entries(character.attributes)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="capitalize text-primary">{key}:</span> {value}
                          </div>
                        ))}
                    </div>
                  </div>
                  {character.isDead ? (
                    <div className="bg-destructive/20 text-destructive p-2 rounded text-center mb-3">
                      Character is deceased
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleSelectCharacter(character.id)}
                      className={`px-4 py-2 rounded ${
                        character.isDead
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "btn-ai"
                      }`}
                      disabled={character.isDead}
                    >
                      {character.isDead ? "View Legacy" : "Play"}
                    </button>
                    <button className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80">
                      Details
                    </button>
                  </div>
                 </div>
              </div>
            ))}

            {/* Create New Character Card */}
            <div
              onClick={handleCreateCharacter}
              className="ai-card flex flex-col items-center justify-center p-8 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 neon-border">
                <span className="text-3xl text-primary">+</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Create New Character
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Start a new adventure with a fresh character
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
