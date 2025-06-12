"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import gameService, { Game } from "@/services/game.service";
import Header from "@/components/Header";
import Link from "next/link";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user's games
  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated]);

  const fetchGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGames = await gameService.getGames();
      setGames(fetchedGames);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load your games. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    // Set the game to delete to show confirmation modal
    setGameToDelete(gameId);
  };

  const confirmDelete = async () => {
    if (!gameToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await gameService.deleteGame(gameToDelete);
      // Remove game from local state to update UI
      setGames(games.filter((game) => game.id !== gameToDelete));
      setGameToDelete(null);
    } catch (err) {
      console.error("Error deleting game:", err);
      setError("Failed to delete game. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setGameToDelete(null);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.firstName || "Adventurer"}!
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Continue a previous adventure or create a new one.
              </p>
            </div>
            <button
              onClick={() => router.push("/create-game")}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none"
            >
              New Game
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Adventures</h2>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="text-xl">Loading your games...</div>
              </div>
            ) : games.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold mb-4">No Games Found</h2>
                <p className="text-gray-600 mb-6">
                  You haven't created any games yet. Start your adventure by
                  creating a new game!
                </p>
                <button
                  onClick={() => router.push("/create-game")}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Create Your First Game
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2 truncate">
                        {game.settings.characterName}
                      </h2>
                      <div className="text-sm text-gray-500 mb-4">
                        {game.settings.theme} · {formatDate(game.updatedAt)}
                      </div>

                      {/* Game stats summary */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                        {Object.entries(game.characterStats)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center mb-1"
                            >
                              <span>{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/game/${game.id}`}
                          className="block flex-grow text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                        >
                          Continue Game
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteGame(game.id);
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          aria-label="Delete game"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Game
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this game? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
