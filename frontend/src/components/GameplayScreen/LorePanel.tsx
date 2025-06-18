"use client";

import React, { useState } from "react";
import { LoreFragment, KnowledgeBaseItem } from "@/services/game.service";

interface LorePanelProps {
  loreFragments: LoreFragment[];
  knowledgeBase: KnowledgeBaseItem[];
  selectedLoreItem: KnowledgeBaseItem | null;
  onCloseLoreDetail: () => void;
}

const LorePanel: React.FC<LorePanelProps> = ({
  loreFragments,
  knowledgeBase,
  selectedLoreItem,
  onCloseLoreDetail,
}) => {
  const [activeTab, setActiveTab] = useState<"fragments" | "knowledge">(
    "fragments"
  );
  const [selectedFragment, setSelectedFragment] = useState<LoreFragment | null>(
    null
  );

  const handleFragmentClick = (fragment: LoreFragment) => {
    setSelectedFragment(selectedFragment === fragment ? null : fragment);
  };

  const getFragmentIcon = (type: LoreFragment["type"]) => {
    switch (type) {
      case "npc":
        return (
          <svg
            className="w-4 h-4"
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
        );
      case "item":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "location":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "general":
        return (
          <svg
            className="w-4 h-4"
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
        );
      default:
        return null;
    }
  };

  const getKnowledgeIcon = (type: KnowledgeBaseItem["type"]) => {
    switch (type) {
      case "npc":
        return (
          <svg
            className="w-4 h-4"
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
        );
      case "item":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "location":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Lore Detail Modal */}
      {selectedLoreItem && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                {getKnowledgeIcon(selectedLoreItem.type)}
                <span className="ml-2">{selectedLoreItem.name}</span>
              </h4>
              <button
                onClick={onCloseLoreDetail}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-200 leading-relaxed">
                {selectedLoreItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Kiến Thức & Truyền Thuyết
        </h3>

        {/* Tabs */}
        <div className="flex space-x-4 mt-3">
          <button
            onClick={() => setActiveTab("fragments")}
            className={`py-1 px-3 text-sm font-medium rounded ${
              activeTab === "fragments"
                ? "bg-amber-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Mảnh Truyền Thuyết ({loreFragments.length})
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`py-1 px-3 text-sm font-medium rounded ${
              activeTab === "knowledge"
                ? "bg-amber-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Cơ Sở Kiến Thức ({knowledgeBase.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "fragments" ? (
          <div className="space-y-2">
            {loreFragments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p>Chưa có mảnh truyền thuyết nào</p>
              </div>
            ) : (
              loreFragments.map((fragment, index) => (
                <div key={index} className="space-y-2">
                  <button
                    onClick={() => handleFragmentClick(fragment)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedFragment === fragment
                        ? "bg-amber-900/50 border-amber-500/50 text-amber-200"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getFragmentIcon(fragment.type)}
                      <span className="font-medium">
                        {fragment.name ||
                          fragment.title ||
                          `${fragment.type} Fragment`}
                      </span>
                    </div>
                  </button>

                  {selectedFragment === fragment && (
                    <div className="ml-4 p-3 bg-gray-700/50 rounded-lg border-l-4 border-amber-500">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {fragment.description || fragment.content}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {knowledgeBase.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
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
                <p>Cơ sở kiến thức trống</p>
              </div>
            ) : (
              knowledgeBase.map((item, index) => (
                <button
                  key={index}
                  className="w-full p-3 rounded-lg border bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-2">
                    {getKnowledgeIcon(item.type)}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LorePanel;
