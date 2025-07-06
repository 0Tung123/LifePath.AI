'use client';

import React, { useState, useEffect } from 'react';
import { PointAllocationSystem } from '@/types/character-creation.types';
import characterCreationService from '@/services/character-creation.service';

interface StatsEditorProps {
  stats: Record<string, number>;
  onStatsChange: (stats: Record<string, number>) => void;
  pointAllocationRules: PointAllocationSystem | null;
  aiSuggestedStats?: Record<string, number>;
  worldType: string;
}

const StatsEditor: React.FC<StatsEditorProps> = ({
  stats,
  onStatsChange,
  pointAllocationRules,
  aiSuggestedStats,
  worldType,
}) => {
  const [localStats, setLocalStats] = useState(stats);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  } | null>(null);

  // Update points used when stats change
  useEffect(() => {
    if (pointAllocationRules) {
      const used = characterCreationService.getTotalPointsUsed(
        localStats,
        pointAllocationRules,
      );
      setPointsUsed(used);
    }
  }, [localStats, pointAllocationRules]);

  // Validate stats
  useEffect(() => {
    if (pointAllocationRules) {
      const validationResult = characterCreationService.validateStatsAllocation(
        localStats,
        pointAllocationRules,
      );
      setValidation(validationResult);
    }
  }, [localStats, pointAllocationRules]);

  const handleStatChange = (statName: string, value: number) => {
    const newStats = { ...localStats, [statName]: value };
    setLocalStats(newStats);
    onStatsChange(newStats);
  };

  const handleAcceptAiSuggestions = () => {
    if (aiSuggestedStats) {
      setLocalStats(aiSuggestedStats);
      onStatsChange(aiSuggestedStats);
    }
  };

  const resetStats = () => {
    const resetStats = Object.keys(localStats).reduce(
      (acc, key) => {
        acc[key] = 10; // Default value
        return acc;
      },
      {} as Record<string, number>,
    );
    setLocalStats(resetStats);
    onStatsChange(resetStats);
  };

  if (!pointAllocationRules) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Đang tải quy tắc phân bổ điểm...
        </span>
      </div>
    );
  }

  const maxPoints =
    pointAllocationRules.totalPoints + pointAllocationRules.bonusPoints;
  const remainingPoints = maxPoints - pointsUsed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Phân Bổ Chỉ Số
        </h2>
        <p className="text-gray-600">
          Tùy chỉnh chỉ số nhân vật theo phong cách chơi mong muốn.
        </p>
      </div>

      {/* Points Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Điểm đã sử dụng:
          </span>
          <span className="text-sm font-bold text-gray-900">
            {pointsUsed} / {maxPoints}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              remainingPoints >= 0 ? 'bg-blue-600' : 'bg-red-600'
            }`}
            style={{
              width: `${Math.min((pointsUsed / maxPoints) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Điểm còn lại: {remainingPoints}</span>
          <span>{remainingPoints < 0 ? 'Vượt quá giới hạn!' : ''}</span>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestedStats && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-purple-900">🤖 Đề xuất từ AI</h3>
            <button
              onClick={handleAcceptAiSuggestions}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Áp dụng
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(aiSuggestedStats).map(([stat, value]) => (
              <div key={stat} className="text-sm">
                <span className="text-purple-700">{stat}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Editor */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(localStats).map(([statName, value]) => {
          const rule = pointAllocationRules.rules.find(
            (r) => r.statName === statName,
          );
          const minValue = rule?.minValue || 6;
          const maxValue = rule?.maxValue || 20;

          return (
            <div key={statName} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  {statName}
                </label>
                <span className="text-sm text-gray-500">
                  {value} / {maxValue}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    handleStatChange(statName, Math.max(minValue, value - 1))
                  }
                  disabled={value <= minValue}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  -
                </button>

                <input
                  type="range"
                  min={minValue}
                  max={maxValue}
                  value={value}
                  onChange={(e) =>
                    handleStatChange(statName, parseInt(e.target.value))
                  }
                  className="flex-1"
                />

                <button
                  onClick={() =>
                    handleStatChange(statName, Math.min(maxValue, value + 1))
                  }
                  disabled={value >= maxValue}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Min: {minValue}</span>
                <span>Max: {maxValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Messages */}
      {validation && !validation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">
            Có lỗi trong phân bổ chỉ số:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
            {validation.errors?.map((error: string, index: number) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation && validation.warnings && validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Cảnh báo:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            {validation.warnings.map((warning: string, index: number) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={resetStats}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Đặt lại
        </button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Hướng dẫn phân bổ điểm:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Tập trung vào 2-3 chỉ số chính để tạo ra nhân vật có đặc trưng
          </li>
          <li>Chỉ số cao hơn sẽ tốn nhiều điểm hơn (hệ số scaling)</li>
          <li>Đừng để chỉ số quá thấp vì sẽ gây khó khăn trong game</li>
          <li>Cân nhắc thế giới {worldType} khi phân bổ</li>
        </ul>
      </div>
    </div>
  );
};

export default StatsEditor;
