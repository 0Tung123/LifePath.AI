"use client";

import React, { useRef, useEffect } from "react";
import { StoryHistoryItem, KnowledgeBaseItem } from "@/services/game.service";

interface StoryHistoryPanelProps {
  storyHistory:
    | StoryHistoryItem[]
    | { text?: string; content?: string; type?: string; timestamp: string }[];
  knowledgeBase: KnowledgeBaseItem[];
  onLoreClick: (item: KnowledgeBaseItem) => void;
  isLoading?: boolean;
}

const StoryHistoryPanel: React.FC<StoryHistoryPanelProps> = ({
  storyHistory,
  knowledgeBase,
  onLoreClick,
  isLoading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyHistory]);

  // Function to highlight lore items in text
  const highlightLoreItems = (text: string) => {
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return <span>{text}</span>;
    }

    // const highlightedText = text;
    const loreItems: { item: KnowledgeBaseItem; regex: RegExp }[] = [];

    // Create regex patterns for each lore item
    knowledgeBase.forEach((item) => {
      const regex = new RegExp(`\\b${item.name}\\b`, "gi");
      loreItems.push({ item, regex });
    });

    // Sort by name length (longest first) to avoid partial matches
    loreItems.sort((a, b) => b.item.name.length - a.item.name.length);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Find all matches
    const matches: { start: number; end: number; item: KnowledgeBaseItem }[] =
      [];

    loreItems.forEach(({ item, regex }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          item,
        });
      }
    });

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep the first one)
    const filteredMatches = matches.filter((match, index) => {
      for (let i = 0; i < index; i++) {
        const prevMatch = matches[i];
        if (match.start < prevMatch.end && match.end > prevMatch.start) {
          return false;
        }
      }
      return true;
    });

    // Build the highlighted text
    filteredMatches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        parts.push(text.slice(lastIndex, match.start));
      }

      // Add the highlighted match
      const matchText = text.slice(match.start, match.end);
      parts.push(
        <button
          key={`lore-${index}`}
          onClick={() => onLoreClick(match.item)}
          className="text-amber-400 underline hover:text-amber-300 cursor-pointer font-medium"
          title={`Click to view ${match.item.name} details`}
        >
          {matchText}
        </button>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  };

  const getItemStyle = (type: StoryHistoryItem["type"]) => {
    switch (type) {
      case "story":
        return "bg-gray-700 border-gray-600";
      case "user_choice":
        return "bg-blue-900/50 border-blue-500/50";
      case "user_custom_action":
        return "bg-purple-900/50 border-purple-500/50";
      case "system":
        return "bg-yellow-900/50 border-yellow-500/50";
      default:
        return "bg-gray-700 border-gray-600";
    }
  };

  const getItemIcon = (type: StoryHistoryItem["type"]) => {
    switch (type) {
      case "story":
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "user_choice":
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "user_custom_action":
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "system":
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
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
          Lịch Sử Câu Chuyện
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96"
      >
        {isLoading ? (
          <div className="text-center text-amber-400 py-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                Đang tải câu chuyện...
              </span>
            </div>
          </div>
        ) : !storyHistory || storyHistory.length === 0 ? (
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
            <p>Câu chuyện của bạn sẽ bắt đầu ở đây...</p>
          </div>
        ) : (
          storyHistory.map((item, index) => {
            // Handle both old format (StorySegment) and new format (StoryHistoryItem)
            const isOldFormat = item.text && !item.content;
            const content = isOldFormat ? item.text : item.content;
            const type = isOldFormat ? "story" : item.type;
            const timestamp = item.timestamp;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getItemStyle(
                  type
                )} backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {getItemIcon(type)}
                    <span className="capitalize">
                      {type === "user_choice" && "Lựa chọn"}
                      {type === "user_custom_action" && "Hành động"}
                      {type === "story" && "Truyện"}
                      {type === "system" && "Hệ thống"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-200 leading-relaxed">
                  {highlightLoreItems(content)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StoryHistoryPanel;
