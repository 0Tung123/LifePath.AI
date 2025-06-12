'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import gameService, { Game } from '@/services/game.service';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
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
                Welcome, {user?.firstName || 'Adventurer'}!
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

                      <Link
                        href={`/game/${game.id}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                      >
                        Continue Game
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}