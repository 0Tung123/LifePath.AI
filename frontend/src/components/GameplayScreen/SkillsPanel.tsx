'use client';

import React, { useState } from 'react';
import { Skill } from '@/services/game.service';

interface SkillsPanelProps {
  characterSkills: Skill[];
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ characterSkills }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(selectedSkill?.name === skill.name ? null : skill);
  };

  const getSkillLevelColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level >= 80) return 'text-purple-400';
    if (level >= 60) return 'text-blue-400';
    if (level >= 40) return 'text-green-400';
    if (level >= 20) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getSkillLevelBar = (level?: number) => {
    if (!level) return 0;
    return Math.min(level, 100);
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Kỹ Năng ({characterSkills.length})
      </h3>

      {characterSkills.length === 0 ? (
        <div className="text-center text-gray-400 py-6">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p>Chưa có kỹ năng nào</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {characterSkills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <button
                onClick={() => handleSkillClick(skill)}
                className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedSkill?.name === skill.name
                    ? 'bg-purple-900/50 border-purple-500/50 text-purple-200'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{skill.name}</span>
                  {skill.level !== undefined && (
                    <span
                      className={`font-bold ${getSkillLevelColor(skill.level)}`}
                    >
                      Lv.{skill.level}
                    </span>
                  )}
                </div>

                {/* Skill Level Bar */}
                {skill.level !== undefined && (
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        skill.level >= 80
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : skill.level >= 60
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : skill.level >= 40
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : skill.level >= 20
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-gray-500 to-gray-400'
                      }`}
                      style={{ width: `${getSkillLevelBar(skill.level)}%` }}
                    ></div>
                  </div>
                )}

                {/* Mastery Level */}
                {skill.mastery && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">
                      {skill.mastery}
                    </span>
                  </div>
                )}
              </button>

              {/* Skill Description */}
              {selectedSkill?.name === skill.name && skill.description && (
                <div className="ml-4 p-3 bg-gray-700/50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsPanel;
