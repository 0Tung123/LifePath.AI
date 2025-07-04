'use client';

import React, { useState } from 'react';

interface BackstoryPanelProps {
  characterName: string;
  backstory: string;
}

const BackstoryPanel: React.FC<BackstoryPanelProps> = ({
  characterName,
  backstory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!backstory || backstory.trim() === '') {
    return null;
  }

  // Truncate backstory for preview (first 100 characters)
  const previewText =
    backstory.length > 100 ? backstory.substring(0, 100) + '...' : backstory;

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div
          className="p-4 cursor-pointer hover:bg-indigo-900/20 transition-all duration-200 rounded-t-lg group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-800/50">
                <svg
                  className="w-5 h-5 text-indigo-400"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-300">
                  Bối Cảnh Nhân Vật
                </h3>
                <p className="text-sm text-gray-400">{characterName}</p>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-indigo-400/80 hidden sm:block">
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </span>
              <button className="p-2 rounded-lg hover:bg-indigo-800/30 transition-colors group-hover:bg-indigo-800/20">
                <svg
                  className={`w-5 h-5 text-indigo-400 transform transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview text when collapsed */}
          {!isExpanded && (
            <div className="mt-3 text-sm text-gray-300 leading-relaxed">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-4 h-4 text-indigo-400/60 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                  />
                </svg>
                <span>{previewText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-indigo-500/20 animate-in slide-in-from-top-2 duration-300">
            <div className="mt-4 text-gray-200 leading-relaxed whitespace-pre-line">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-indigo-400/60 mt-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div className="flex-1">
                  <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/10">
                    {backstory}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackstoryPanel;
