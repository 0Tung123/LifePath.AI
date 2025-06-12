"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { GameSettings } from "@/services/game.service";
import Header from "@/components/Header";

export default function CreateGame() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { createGame, isLoading: gameLoading, error: gameError } = useGame();
  const router = useRouter();

  const [formData, setFormData] = useState<GameSettings>({
    theme: "",
    setting: "",
    characterName: "",
    characterBackstory: "",
    additionalSettings: {
      style: "Chinese",
      difficulty: "medium",
      gameLength: "medium",
      combatStyle: "balanced",
    },
  });

  const [error, setError] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Update error state when game error changes
  useEffect(() => {
    if (gameError) {
      setError(gameError);
    }
  }, [gameError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof GameSettings] as Record<
            string,
            unknown
          >),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const game = await createGame(formData);
      router.push(`/game/${game.id}`);
    } catch (err) {
      setError("Failed to create game. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Adventure</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {error && (
                <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      required
                      value={formData.theme}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a theme</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Post-Apocalyptic">Post-Apocalyptic</option>
                      <option value="Historical">Historical</option>
                      <option value="Modern">Modern</option>
                      <option value="Horror">Horror</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="setting"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Setting
                    </label>
                    <input
                      type="text"
                      name="setting"
                      id="setting"
                      required
                      placeholder="e.g., Medieval Kingdom, Space Station, Zombie Wasteland"
                      value={formData.setting}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="characterName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Character Name
                    </label>
                    <input
                      type="text"
                      name="characterName"
                      id="characterName"
                      required
                      value={formData.characterName}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="additionalSettings.style"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Storytelling Style
                    </label>
                    <select
                      id="additionalSettings.style"
                      name="additionalSettings.style"
                      value={formData.additionalSettings?.style}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Chinese">
                        Chinese Style (Tiên Hiệp, Huyền Huyễn)
                      </option>
                      <option value="Korean">
                        Korean Style (Murim, Hunter, Học Đường)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="additionalSettings.difficulty"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Difficulty
                    </label>
                    <select
                      id="additionalSettings.difficulty"
                      name="additionalSettings.difficulty"
                      value={formData.additionalSettings?.difficulty}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label
                      htmlFor="characterBackstory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Character Backstory
                    </label>
                    <textarea
                      id="characterBackstory"
                      name="characterBackstory"
                      rows={4}
                      required
                      placeholder="Describe your character's background, motivations, and goals..."
                      value={formData.characterBackstory}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={gameLoading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {gameLoading ? "Creating Adventure..." : "Start New Adventure"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}