"use client";

import React from "react";
import { GameStats } from "@/services/game.service";

interface CharacterStatsPanelProps {
  characterStats: GameStats;
}

const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({
  characterStats,
}) => {
  // Calculate EXP bar percentage
  const getExpPercentage = () => {
    const currentExp = Number(
      characterStats.KinhNghiem || characterStats.Experience || 0
    );
    const maxExp = Number(
      characterStats.KinhNghiemCanLenCap || characterStats.MaxExperience || 100
    );
    return Math.min((currentExp / maxExp) * 100, 100);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Chỉ Số Nhân Vật
      </h3>

      <div className="space-y-3">
        {/* Character Stats */}
        {Object.entries(characterStats).map(([key, value]) => {
          // Skip EXP related fields as they're handled separately
          if (
            key === "KinhNghiem" ||
            key === "KinhNghiemCanLenCap" ||
            key === "Experience" ||
            key === "MaxExperience"
          ) {
            return null;
          }

          return (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">{key}:</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          );
        })}

        {/* Experience Bar */}
        {(characterStats.KinhNghiem || characterStats.Experience) && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">Kinh Nghiệm:</span>
              <span className="text-white text-sm">
                {characterStats.KinhNghiem || characterStats.Experience} /{" "}
                {characterStats.KinhNghiemCanLenCap ||
                  characterStats.MaxExperience}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getExpPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterStatsPanel;
