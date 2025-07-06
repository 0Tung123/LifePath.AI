'use client';

import React from 'react';
import { GameStats } from '@/types/shared';

interface CharacterStatsPanelProps {
  characterStats: GameStats;
}

const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({
  characterStats,
}) => {
  // Helper function to convert complex stat values to displayable strings
  const formatStatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    // Handle CharacterLevel
    if (
      value &&
      typeof value === 'object' &&
      'current' in value &&
      'xp' in value
    ) {
      return `Level ${value.current} (${value.xp} XP)`;
    }

    // Handle CultivationInfo
    if (value && typeof value === 'object' && 'realm' in value) {
      const cultivationInfo = value as { realm: unknown; stage?: unknown };
      return cultivationInfo.stage
        ? `${cultivationInfo.realm} - ${cultivationInfo.stage}`
        : String(cultivationInfo.realm);
    }

    // Handle ExperiencePoints
    if (value && typeof value === 'object' && 'character' in value) {
      const experiencePoints = value as {
        character: unknown;
        cultivation?: unknown;
        skills?: unknown;
      };
      return `Char: ${experiencePoints.character}${experiencePoints.cultivation ? `, Cult: ${experiencePoints.cultivation}` : ''}${experiencePoints.skills ? `, Skills: ${experiencePoints.skills}` : ''}`;
    }

    // Handle Record<string, SkillExperience>
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value);
      if (entries.length > 0) {
        // Check if it's a skill experience record
        const firstEntry = entries[0][1];
        if (
          firstEntry &&
          typeof firstEntry === 'object' &&
          'level' in firstEntry &&
          'xp' in firstEntry
        ) {
          return entries
            .map(
              ([skill, exp]: [string, { level: number; xp: number }]) =>
                `${skill}: Lv${exp.level}`,
            )
            .join(', ');
        }
        // Handle generic object
        return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // Fallback to JSON string
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  // Calculate EXP bar percentage
  const getExpPercentage = () => {
    const currentExp = Number(
      characterStats.KinhNghiem || characterStats.Experience || 0,
    );
    const maxExp = Number(
      characterStats.KinhNghiemCanLenCap || characterStats.MaxExperience || 100,
    );
    return Math.min((currentExp / maxExp) * 100, 100);
  };

  // Calculate Health bar percentage
  const getHealthPercentage = () => {
    const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];

    for (const key of healthKeys) {
      if (characterStats[key]) {
        const healthValue = String(characterStats[key]);
        if (healthValue.includes('/')) {
          const [current, max] = healthValue.split('/').map(Number);
          return Math.min((current / max) * 100, 100);
        }
      }
    }
    return 100; // Default to full health if no health stat found
  };

  // Get health display info
  const getHealthInfo = () => {
    const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];

    for (const key of healthKeys) {
      if (characterStats[key]) {
        return {
          key,
          value: characterStats[key],
          current: characterStats[key].toString().includes('/')
            ? Number(characterStats[key].toString().split('/')[0])
            : Number(characterStats[key]),
          max: characterStats[key].toString().includes('/')
            ? Number(characterStats[key].toString().split('/')[1])
            : Number(characterStats[key]),
        };
      }
    }
    return null;
  };

  const healthInfo = getHealthInfo();
  const healthPercentage = getHealthPercentage();

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
        {/* Health Bar */}
        {healthInfo && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">{healthInfo.key}:</span>
              <span className="text-white text-sm">
                {healthInfo.current} / {healthInfo.max}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  healthPercentage > 60
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : healthPercentage > 30
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
            {healthPercentage <= 0 && (
              <div className="text-red-400 text-xs mt-1 font-medium">
                💀 Nhân vật đã chết!
              </div>
            )}
          </div>
        )}

        {/* Character Stats */}
        {Object.entries(characterStats).map(([key, value]) => {
          // Skip EXP and Health related fields as they're handled separately
          if (
            key === 'KinhNghiem' ||
            key === 'KinhNghiemCanLenCap' ||
            key === 'Experience' ||
            key === 'MaxExperience' ||
            key === 'Health' ||
            key === 'Máu' ||
            key === 'Sinh Lực' ||
            key === 'HP' ||
            key === 'Sức Khỏe'
          ) {
            return null;
          }

          return (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">{key}:</span>
              <span className="text-white font-medium">
                {formatStatValue(value)}
              </span>
            </div>
          );
        })}

        {/* Experience Bar */}
        {(characterStats.KinhNghiem || characterStats.Experience) && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">Kinh Nghiệm:</span>
              <span className="text-white text-sm">
                {formatStatValue(
                  characterStats.KinhNghiem || characterStats.Experience,
                )}{' '}
                /{' '}
                {formatStatValue(
                  characterStats.KinhNghiemCanLenCap ||
                    characterStats.MaxExperience,
                )}
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
