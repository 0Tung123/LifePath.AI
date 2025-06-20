"use client";

import React from "react";

interface KarmaReputationPanelProps {
  karmaScore: number;
  reputation?: { [key: string]: number };
}

export default function KarmaReputationPanel({
  karmaScore,
  reputation = {},
}: KarmaReputationPanelProps) {
  // Determine karma level and color
  const getKarmaLevel = (score: number) => {
    if (score >= 100) return { level: "Saint", color: "text-yellow-400" };
    if (score >= 50) return { level: "Good", color: "text-green-400" };
    if (score >= 10) return { level: "Neutral+", color: "text-blue-400" };
    if (score >= -10) return { level: "Neutral", color: "text-gray-400" };
    if (score >= -50) return { level: "Neutral-", color: "text-orange-400" };
    if (score >= -100) return { level: "Evil", color: "text-red-400" };
    return { level: "Demon", color: "text-purple-400" };
  };

  const karmaInfo = getKarmaLevel(karmaScore);

  // Get reputation level description
  const getReputationLevel = (score: number) => {
    if (score >= 80) return { level: "Revered", color: "text-yellow-400" };
    if (score >= 60) return { level: "Honored", color: "text-green-400" };
    if (score >= 40) return { level: "Friendly", color: "text-blue-400" };
    if (score >= 20) return { level: "Neutral", color: "text-gray-400" };
    if (score >= 0) return { level: "Unfriendly", color: "text-orange-400" };
    if (score >= -20) return { level: "Hostile", color: "text-red-400" };
    return { level: "Hated", color: "text-purple-400" };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        Karma & Reputation
      </h3>

      {/* Karma Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Karma:</span>
          <div className="flex items-center space-x-2">
            <span className={`font-bold ${karmaInfo.color}`}>
              {karmaInfo.level}
            </span>
            <span className="text-gray-400">({karmaScore})</span>
          </div>
        </div>
        
        {/* Karma Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              karmaScore >= 0 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(Math.abs(karmaScore), 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Reputation Section */}
      {Object.keys(reputation).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-md font-medium text-gray-300">Reputation:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.entries(reputation).map(([faction, score]) => {
              const repInfo = getReputationLevel(score);
              return (
                <div key={faction} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm capitalize">
                    {faction.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${repInfo.color}`}>
                      {repInfo.level}
                    </span>
                    <span className="text-gray-500 text-xs">({score})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for reputation */}
      {Object.keys(reputation).length === 0 && (
        <div className="text-gray-500 text-sm italic">
          No faction relationships established yet
        </div>
      )}
    </div>
  );
}