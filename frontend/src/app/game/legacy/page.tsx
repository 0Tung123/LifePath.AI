"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore, type Legacy } from "@/store/game-store";

export default function LegacyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyId = searchParams.get("id");
  
  const { viewLegacy, isLoading, error } = useGameStore();
  const [legacy, setLegacy] = useState<Legacy | null>(null);
  
  useEffect(() => {
    if (!legacyId) {
      router.push("/game");
      return;
    }
    
    const fetchLegacy = async () => {
      try {
        const legacyData = await viewLegacy(legacyId);
        setLegacy(legacyData);
      } catch (error) {
        console.error("Failed to fetch legacy:", error);
      }
    };
    
    fetchLegacy();
  }, [legacyId, router, viewLegacy]);
  
  if (!legacyId) {
    return null; // Will redirect to game page
  }
  
  if (isLoading || !legacy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Legacy...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Character Legacy</h1>
          <button
            onClick={() => router.push("/game")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Characters
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-gray-800 text-white rounded-lg overflow-hidden mb-8">
          <div className="p-6 text-center border-b border-gray-700">
            <h2 className="text-3xl font-bold mb-2">{legacy.characterName}</h2>
            <p className="text-xl text-gray-300 italic mb-4">"{legacy.epitaph}"</p>
            <div className="flex justify-center space-x-4 text-sm">
              <div>
                <span className="text-gray-400">Final Level:</span>{" "}
                <span className="font-medium">{legacy.finalLevel}</span>
              </div>
              <div>
                <span className="text-gray-400">Days Survived:</span>{" "}
                <span className="font-medium">{legacy.daysSurvived}</span>
              </div>
              <div>
                <span className="text-gray-400">Died On:</span>{" "}
                <span className="font-medium">
                  {new Date(legacy.deathDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="font-bold">Final Attributes</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(legacy.finalAttributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize font-medium">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h3 className="font-bold">Achievements</h3>
            </div>
            <div className="p-4">
              {legacy.achievements.length === 0 ? (
                <p className="text-gray-500 italic">No achievements recorded</p>
              ) : (
                <ul className="space-y-2">
                  {legacy.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">★</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h3 className="font-bold">Story Summary</h3>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-line">{legacy.storySummary}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            The legacy of {legacy.characterName} will be remembered.
          </p>
          <button
            onClick={() => router.push("/game/character-creation")}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Create New Character
          </button>
        </div>
      </div>
    </div>
  );
}