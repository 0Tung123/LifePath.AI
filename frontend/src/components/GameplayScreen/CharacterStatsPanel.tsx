'use client';

import React from 'react';
import { GameStats, CharacterAttributes } from '@/types/shared';
import {
  getNarrativeTerm,
  formatStatName,
  formatLevelDisplay,
} from '@/utils/narrativeTerms';

interface CharacterStatsPanelProps {
  characterStats: GameStats;
  narrativeStyle?: string;
}

// Type guard function
function isCharacterAttributes(obj: unknown): obj is CharacterAttributes {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    'strength' in obj &&
    'agility' in obj &&
    'intelligence' in obj &&
    'wisdom' in obj &&
    'charisma' in obj &&
    'constitution' in obj &&
    'luck' in obj &&
    'health' in obj &&
    'experience' in obj &&
    'level' in obj &&
    'nextLevelExp' in obj
  );
}

const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({
  characterStats,
  narrativeStyle,
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
      return `${formatLevelDisplay(value.current as number, narrativeStyle)} (${value.xp} ${getNarrativeTerm('experience', narrativeStyle)})`;
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
      return `Nhân vật: ${experiencePoints.character}${experiencePoints.cultivation ? `, Tu luyện: ${experiencePoints.cultivation}` : ''}${experiencePoints.skills ? `, Kỹ năng: ${experiencePoints.skills}` : ''}`;
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
                `${skill}: ${formatLevelDisplay(exp.level as number, narrativeStyle)}`,
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
    // Check for new standardized health format first
    if (isCharacterAttributes(characterStats.attributes)) {
      const attrs = characterStats.attributes;
      if (attrs.health) {
        const { current, max } = attrs.health;
        return Math.min((current / max) * 100, 100);
      }
    }

    // Fallback to legacy format
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
  const attributes = isCharacterAttributes(characterStats.attributes)
    ? characterStats.attributes
    : undefined;

  // Helper function to get attribute name based on narrative style
  const getAttributeName = (attr: string): string => {
    return formatStatName(attr, narrativeStyle);
  };

  // Helper function to get attribute color based on value
  const getAttributeColor = (value: number): string => {
    if (value >= 16) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (value >= 14) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (value >= 12) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (value >= 10) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (value >= 8) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gradient-to-r from-red-500 to-red-600';
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
        {/* Health Bar */}
        {(healthInfo || attributes?.health) && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">
                {getNarrativeTerm('health', narrativeStyle)}:
              </span>
              <span className="text-white text-sm">
                {attributes?.health
                  ? `${attributes.health.current} / ${attributes.health.max}`
                  : `${healthInfo?.current} / ${healthInfo?.max}`}
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

        {/* Standardized Attributes */}
        {attributes && (
          <div className="space-y-3">
            {/* Main Attributes */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'strength',
                'agility',
                'intelligence',
                'wisdom',
                'charisma',
                'constitution',
                'luck',
              ].map((attr) => {
                const value = attributes[attr as keyof typeof attributes];
                if (typeof value !== 'number') return null;

                return (
                  <div key={attr} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">
                        {getAttributeName(attr)}:
                      </span>
                      <span className="text-white text-sm font-medium">
                        {value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getAttributeColor(value)}`}
                        style={{
                          width: `${Math.min(100, (value / 20) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Experience Bar */}
            {(attributes.experience !== undefined ||
              attributes.nextLevelExp !== undefined) && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">
                    {getNarrativeTerm('experience', narrativeStyle)}:
                  </span>
                  <span className="text-white text-sm">
                    {attributes.experience || 0} /{' '}
                    {attributes.nextLevelExp || 100}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((attributes.experience || 0) / (attributes.nextLevelExp || 100)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Level Display */}
            {attributes.level !== undefined && (
              <div className="mt-4 flex justify-center">
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-full px-4 py-2">
                  <span className="text-amber-400 font-semibold">
                    {formatLevelDisplay(
                      attributes.level as number,
                      narrativeStyle,
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Mana Bar (if exists) */}
            {attributes.mana && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">
                    {getNarrativeTerm('mana', narrativeStyle)}:
                  </span>
                  <span className="text-white text-sm">
                    {attributes.mana.current} / {attributes.mana.max}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(attributes.mana.current / attributes.mana.max) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Stamina Bar (if exists) */}
            {attributes.stamina && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">Thể Lực:</span>
                  <span className="text-white text-sm">
                    {attributes.stamina.current} / {attributes.stamina.max}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-lime-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(attributes.stamina.current / attributes.stamina.max) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Cultivation (if exists) */}
            {attributes.cultivation && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">
                    {narrativeStyle === 'Chinese' ? 'Tu Vi' : 'Tu luyện'}:
                  </span>
                  <span className="text-white text-sm">
                    {attributes.cultivation.level}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(attributes.cultivation.progress / attributes.cultivation.maxProgress) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legacy Stats (for backward compatibility) */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            Chỉ số khác
          </h4>
          <div className="space-y-1">
            {Object.entries(characterStats).map(([key, value]) => {
              // Skip attributes we've already displayed
              if (
                key === 'attributes' ||
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
          </div>
        </div>

        {/* Legacy Experience Bar (fallback) */}
        {!attributes &&
          (characterStats.KinhNghiem || characterStats.Experience) && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">
                  {getNarrativeTerm('experience', narrativeStyle)}:
                </span>
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
