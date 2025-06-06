"use client";

import React, { useState, useEffect } from "react";

interface TimelineNode {
  id: string;
  content: string;
  selectedChoiceText?: string;
  stepOrder: number;
  isCurrent: boolean;
}

interface StoryTimelineProps {
  sessionId: string;
  onNodeSelect: (nodeId: string) => void;
  currentNodeId?: string;
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({
  sessionId,
  onNodeSelect,
  currentNodeId,
}) => {
  const [pathHistory, setPathHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => {
    loadPathHistory();
  }, [sessionId]);

  const loadPathHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/game/sessions/${sessionId}/path-history`
      );
      const data = await response.json();
      setPathHistory(data);

      // Set current step
      const currentIndex = data.currentPath.findIndex(
        (nodeId: string) => nodeId === currentNodeId
      );
      if (currentIndex >= 0) {
        setSelectedStep(currentIndex);
      }
    } catch (error) {
      console.error("Failed to load path history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (pathHistory && pathHistory.currentPath[stepIndex]) {
      setSelectedStep(stepIndex);
      onNodeSelect(pathHistory.currentPath[stepIndex]);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stepIndex = parseInt(event.target.value);
    handleStepClick(stepIndex);
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!pathHistory || pathHistory.currentPath.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400 text-sm">Chưa có lịch sử đường đi</p>
      </div>
    );
  }

  const maxSteps = pathHistory.currentPath.length - 1;

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Timeline Câu chuyện
      </h3>

      {/* Timeline Slider */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={maxSteps}
            value={selectedStep}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (selectedStep / maxSteps) * 100
              }%, #374151 ${(selectedStep / maxSteps) * 100}%, #374151 100%)`,
            }}
          />

          {/* Step markers */}
          <div className="flex justify-between mt-2">
            {pathHistory.currentPath.map((nodeId: string, index: number) => (
              <button
                key={nodeId}
                onClick={() => handleStepClick(index)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  index === selectedStep
                    ? "bg-blue-500 border-blue-500 scale-125"
                    : index < selectedStep
                    ? "bg-blue-400 border-blue-400"
                    : "bg-gray-600 border-gray-600"
                } hover:scale-110`}
                title={`Bước ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Step info */}
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">
            Bước {selectedStep + 1} / {pathHistory.currentPath.length}
          </span>
        </div>
      </div>

      {/* Current step details */}
      {pathHistory.pathNodes[selectedStep] && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
              Bước {selectedStep + 1}
            </span>
            {selectedStep === pathHistory.currentPath.length - 1 && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Hiện tại
              </span>
            )}
          </div>

          <div className="text-sm text-gray-300 mb-2 line-clamp-3">
            {pathHistory.pathNodes[selectedStep].content.substring(0, 150)}...
          </div>

          {pathHistory.pathNodes[selectedStep].selectedChoiceText && (
            <div className="text-xs text-blue-400 italic">
              → {pathHistory.pathNodes[selectedStep].selectedChoiceText}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handleStepClick(Math.max(0, selectedStep - 1))}
          disabled={selectedStep === 0}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          ← Trước
        </button>

        <button
          onClick={() => handleStepClick(Math.min(maxSteps, selectedStep + 1))}
          disabled={selectedStep === maxSteps}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          Sau →
        </button>
      </div>

      {/* Branch indicator */}
      {pathHistory.allNodes.length > pathHistory.pathNodes.length && (
        <div className="mt-4 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs text-yellow-400">
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Có {pathHistory.allNodes.length - pathHistory.pathNodes.length} nhánh
          khác chưa khám phá
        </div>
      )}
    </div>
  );
};
