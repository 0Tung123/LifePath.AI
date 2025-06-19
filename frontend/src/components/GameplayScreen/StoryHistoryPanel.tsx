"use client";

import React, { useRef, useEffect, useState } from "react";
import { StoryHistoryItem, KnowledgeBaseItem } from "@/services/game.service";

interface StoryHistoryPanelProps {
  storyHistory:
    | StoryHistoryItem[]
    | { text?: string; content?: string; type?: string; timestamp: string }[];
  knowledgeBase: KnowledgeBaseItem[];
  onLoreClick: (item: KnowledgeBaseItem) => void;
  isLoading?: boolean;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

interface ContentSegment {
  type: "dialogue" | "monologue" | "action" | "description" | "system" | "item";
  content: string;
  speaker?: string;
  itemRarity?: "common" | "good" | "rare" | "epic" | "legendary";
}

const StoryHistoryPanel: React.FC<StoryHistoryPanelProps> = ({
  storyHistory,
  knowledgeBase,
  onLoreClick,
  isLoading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  // Auto scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyHistory]);

  // Content type detection functions
  const detectContentType = (text: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    const lines = text.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();

      // System messages
      if (trimmedLine.match(/^\[Hệ Thống\]|^\[System\]|^✨|^📊|^🎯/)) {
        segments.push({
          type: "system",
          content: trimmedLine,
        });
        continue;
      }

      // Dialogue detection (quotes or speaker patterns)
      // Pattern 1: "Speaker: 'dialogue'" or "Speaker: "dialogue""
      const speakerDialogueMatch = trimmedLine.match(
        /^([^:"]+):\s*["']([^"']*)["']$/
      );
      if (speakerDialogueMatch) {
        const speaker = speakerDialogueMatch[1]?.trim();
        const dialogue = speakerDialogueMatch[2];
        segments.push({
          type: "dialogue",
          content: dialogue,
          speaker: speaker,
        });
        continue;
      }

      // Pattern for character speaking without quotes: "Character nói: content"
      const characterSpeakingMatch = trimmedLine.match(
        /^([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]*)\s+(nói|hét|thì thầm|chửi|gào|la|kêu|thốt|thở dài|cười|khẽ nói):\s*(.+)$/i
      );
      if (characterSpeakingMatch) {
        const speaker = characterSpeakingMatch[1]?.trim();
        const dialogue = characterSpeakingMatch[3]
          ?.trim()
          .replace(/^["']|["']$/g, "");
        segments.push({
          type: "dialogue",
          content: dialogue,
          speaker: speaker,
        });
        continue;
      }

      // Pattern 2: Just quoted text ""dialogue"" or 'dialogue'
      const quotedTextMatch = trimmedLine.match(/^["']([^"']*)["']$/);
      if (quotedTextMatch) {
        const dialogue = quotedTextMatch[1];

        // Check if it's a sound effect, skill name, or exclamation (not actual dialogue)
        const soundEffectPattern =
          /^(xoẹt|boom|bang|crash|whoosh|slash|thud|clang|rít|gầm|gừ|ầm|ào|khốn|chết|damn|shit|fuck|hell)[\s!]*$/i;
        const isShortExclamation =
          dialogue.length <= 10 &&
          /^[!?]+$/.test(dialogue.replace(/[a-zA-ZÀ-ỹ\s]/g, ""));
        const isSkillOrAction =
          /^(tấn công|phòng thủ|né tránh|skill|kỹ năng|magic|spell|attack|defend|dodge|cơ bản|nâng cao|đặc biệt)/i.test(
            dialogue
          );
        const isSoundEffect =
          /^[a-zA-ZÀ-ỹ]*[!]+$/.test(dialogue) && dialogue.length <= 8;

        if (
          soundEffectPattern.test(dialogue) ||
          isShortExclamation ||
          isSkillOrAction ||
          isSoundEffect
        ) {
          // Treat as action/sound effect, not dialogue
          segments.push({
            type: "action",
            content: `"${dialogue}"`,
          });
        } else {
          // For actual dialogue, don't assign "Không rõ" unless it's clearly dialogue
          // Most quoted text in story context should be treated as description or action
          segments.push({
            type: "description",
            content: `"${dialogue}"`,
          });
        }
        continue;
      }

      // Internal monologue (italic markers or thought patterns)
      if (trimmedLine.match(/^\*.*\*$|^_.*_$|nghĩ thầm|tự nhủ|trong lòng/i)) {
        segments.push({
          type: "monologue",
          content: trimmedLine.replace(/^\*|\*$|^_|_$/g, "").trim(),
        });
        continue;
      }

      // Item detection (brackets or item keywords)
      const itemMatch = trimmedLine.match(
        /\[([^\]]+)\]|\b(kiếm|đao|giáp|bùa|thuốc|đan|thạch|ngọc|châu|bảo)\b/i
      );
      if (itemMatch) {
        segments.push({
          type: "item",
          content: trimmedLine,
          itemRarity: detectItemRarity(trimmedLine),
        });
        continue;
      }

      // Action detection (action verbs or movement)
      if (
        trimmedLine.match(
          /\b(đi|chạy|nhảy|tấn công|phòng thủ|sử dụng|cầm|lấy|mở|đóng|nói|hét|thì thầm)\b/i
        )
      ) {
        segments.push({
          type: "action",
          content: trimmedLine,
        });
        continue;
      }

      // Default to description
      segments.push({
        type: "description",
        content: trimmedLine,
      });
    }

    return segments;
  };

  const detectItemRarity = (text: string): ContentSegment["itemRarity"] => {
    if (text.match(/huyền thoại|legendary|vàng kim/i)) return "legendary";
    if (text.match(/sử thi|epic|tím|violet/i)) return "epic";
    if (text.match(/hiếm|rare|xanh lam|blue/i)) return "rare";
    if (text.match(/tốt|good|xanh lục|green/i)) return "good";
    return "common";
  };

  // Tooltip functions
  const showTooltip = (content: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Function to get character color based on name
  const getCharacterColor = (speakerName: string) => {
    // Predefined colors for common character types
    const colorMap: { [key: string]: string } = {
      // Main character variations
      bạn: "text-emerald-400",
      tôi: "text-emerald-400",
      ta: "text-emerald-400",

      // Elder/Master titles
      "trưởng lão": "text-amber-400",
      "sư phụ": "text-amber-400",
      thầy: "text-amber-400",
      "sư tổ": "text-amber-400",

      // System/Narrator
      "hệ thống": "text-cyan-400",
      "người kể": "text-gray-400",
      narrator: "text-gray-400",
    };

    // Check for predefined mappings first
    const lowerName = speakerName.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }

    // Generate consistent color based on name hash
    const colors = [
      "text-blue-400", // Default blue
      "text-purple-400", // Purple
      "text-pink-400", // Pink
      "text-rose-400", // Rose
      "text-orange-400", // Orange
      "text-yellow-400", // Yellow
      "text-lime-400", // Lime
      "text-green-400", // Green
      "text-teal-400", // Teal (but different from lore items)
      "text-sky-400", // Sky
      "text-indigo-400", // Indigo
      "text-violet-400", // Violet
    ];

    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < speakerName.length; i++) {
      hash = ((hash << 5) - hash + speakerName.charCodeAt(i)) & 0xffffffff;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Function to highlight items in brackets [item] with yellow color
  const highlightBracketItems = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    const bracketRegex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = bracketRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the highlighted bracket item
      const itemName = match[1];
      parts.push(
        <span
          key={`bracket-${match.index}`}
          className="text-yellow-400 font-medium bg-yellow-400/10 px-1 rounded"
        >
          [{itemName}]
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 1 ? <>{parts}</> : <span>{text}</span>;
  };

  // Function to highlight lore items in text
  const highlightLoreItems = (text: string) => {
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return highlightBracketItems(text);
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
          onMouseEnter={(e) =>
            showTooltip(
              match.item.description || `Chi tiết về ${match.item.name}`,
              e
            )
          }
          onMouseLeave={hideTooltip}
          className="text-teal-400 hover:text-teal-300 cursor-pointer font-medium transition-colors duration-200 underline decoration-teal-400/50 hover:decoration-teal-300/70"
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

  // Render content segments with styling
  const renderContentSegments = (segments: ContentSegment[]) => {
    return segments.map((segment, index) => {
      switch (segment.type) {
        case "dialogue":
          const speakerColor = segment.speaker
            ? getCharacterColor(segment.speaker)
            : "text-blue-400";
          const borderColor = speakerColor
            .replace("text-", "border-")
            .replace("-400", "-400/30");

          return (
            <div key={index} className="mb-3">
              {segment.speaker && (
                <div className={`font-bold ${speakerColor} mb-1`}>
                  {segment.speaker}:
                </div>
              )}
              <div
                className={`text-gray-200 font-sans pl-4 border-l-2 ${borderColor}`}
              >
                &ldquo;{highlightLoreItems(segment.content)}&rdquo;
              </div>
            </div>
          );

        case "monologue":
          return (
            <div key={index} className="mb-2 italic text-purple-300 font-sans">
              <span className="opacity-60">*</span>
              {highlightLoreItems(segment.content)}
              <span className="opacity-60">*</span>
            </div>
          );

        case "action":
          return (
            <div key={index} className="mb-2 font-bold text-orange-400">
              {highlightLoreItems(segment.content)}
            </div>
          );

        case "system":
          const systemIcon = segment.content.includes("✨")
            ? "✨"
            : segment.content.includes("📊")
            ? "📊"
            : segment.content.includes("🎯")
            ? "🎯"
            : "⚙️";
          const systemColor = segment.content.includes("✨")
            ? "text-yellow-400"
            : segment.content.includes("📊")
            ? "text-blue-400"
            : segment.content.includes("🎯")
            ? "text-green-400"
            : "text-gray-400";

          return (
            <div
              key={index}
              className={`mb-2 p-3 rounded-lg bg-gray-800/50 border-l-4 ${
                segment.content.includes("✨")
                  ? "border-yellow-400"
                  : segment.content.includes("📊")
                  ? "border-blue-400"
                  : segment.content.includes("🎯")
                  ? "border-green-400"
                  : "border-gray-400"
              }`}
            >
              <span className={`${systemColor} font-medium`}>
                {systemIcon} {highlightLoreItems(segment.content)}
              </span>
            </div>
          );

        case "item":
          const rarityColors = {
            common: "text-gray-400 border-gray-500",
            good: "text-green-400 border-green-500",
            rare: "text-blue-400 border-blue-500",
            epic: "text-purple-400 border-purple-500",
            legendary: "text-yellow-400 border-yellow-500",
          };

          return (
            <div key={index} className="mb-2">
              <span
                className={`inline-block px-2 py-1 rounded border ${
                  rarityColors[segment.itemRarity || "common"]
                } bg-gray-800/30 font-medium cursor-help`}
                onMouseEnter={(e) =>
                  showTooltip(
                    `Vật phẩm ${segment.itemRarity || "phổ thông"}`,
                    e
                  )
                }
                onMouseLeave={hideTooltip}
              >
                {highlightLoreItems(segment.content)}
              </span>
            </div>
          );

        case "description":
        default:
          return (
            <div
              key={index}
              className="mb-2 text-gray-200 font-sans leading-relaxed"
            >
              {highlightLoreItems(segment.content)}
            </div>
          );
      }
    });
  };

  const getItemStyle = (type: StoryHistoryItem["type"]) => {
    switch (type) {
      case "story":
        return "bg-gray-900/80 border-gray-600/50 backdrop-blur-sm";
      case "user_choice":
        return "bg-blue-900/30 border-blue-400/40 backdrop-blur-sm";
      case "user_custom_action":
        return "bg-purple-900/30 border-purple-400/40 backdrop-blur-sm";
      case "user_thinking":
        return "bg-indigo-900/30 border-indigo-400/40 backdrop-blur-sm";
      case "user_communication":
        return "bg-green-900/30 border-green-400/40 backdrop-blur-sm";
      case "system":
        return "bg-yellow-900/20 border-yellow-400/30 backdrop-blur-sm";
      default:
        return "bg-gray-900/80 border-gray-600/50 backdrop-blur-sm";
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
      case "user_thinking":
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        );
      case "user_communication":
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
    <div className="relative">
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg border border-purple-500/20 h-full flex flex-col shadow-2xl">
        {/* Header với thiết kế thư pháp */}
        <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-gray-800 to-gray-900">
          <h3 className="text-xl font-bold text-amber-400 flex items-center font-sans">
            <svg
              className="w-6 h-6 mr-3 text-amber-500"
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
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Mặc Ảnh Thư Hương
            </span>
            <span className="text-sm text-gray-400 ml-2 font-normal">
              • Lịch Sử Câu Chuyện
            </span>
          </h3>
        </div>

        {/* Content Area với thiết kế giấy cổ */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 max-h-96 bg-gradient-to-b from-gray-800/50 to-gray-900/50"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        >
          {isLoading ? (
            <div className="text-center text-amber-400 py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-amber-400/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
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
                <span className="text-lg font-sans text-amber-300">
                  Mực đang thấm vào giấy...
                </span>
                <span className="text-sm text-gray-400">
                  Đang tải câu chuyện của bạn
                </span>
              </div>
            </div>
          ) : !storyHistory || storyHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="relative mb-6">
                <svg
                  className="w-20 h-20 mx-auto opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-lg font-sans text-gray-300 mb-2">
                Trang giấy còn trắng...
              </p>
              <p className="text-sm text-gray-500">
                Câu chuyện của bạn sẽ được viết nên từ đây
              </p>
            </div>
          ) : (
            storyHistory.map((item, index) => {
              // Handle both old format (StorySegment) and new format (StoryHistoryItem)
              const isOldFormat =
                "text" in item && item.text && !("content" in item);
              const content = isOldFormat
                ? (item as { text: string }).text
                : (item as StoryHistoryItem).content;
              const type = isOldFormat
                ? "story"
                : (item as StoryHistoryItem).type;
              const timestamp = item.timestamp;

              // Detect content segments for advanced styling
              const contentSegments = detectContentType(content);

              return (
                <div
                  key={index}
                  className={`relative p-5 rounded-xl border ${getItemStyle(
                    type
                  )} shadow-lg hover:shadow-xl transition-all duration-300 group`}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-600/30">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        {getItemIcon(type)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-300 capitalize font-sans">
                          {type === "user_choice" && "Lựa Chọn Của Bạn"}
                          {type === "user_custom_action" && "Hành Động Tự Do"}
                          {type === "story" && "Câu Chuyện"}
                          {type === "system" && "Thông Báo Hệ Thống"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Type indicator */}
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type === "story"
                          ? "bg-gray-700/50 text-gray-300"
                          : type === "user_choice"
                          ? "bg-blue-900/50 text-blue-300"
                          : type === "user_custom_action"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-yellow-900/50 text-yellow-300"
                      }`}
                    >
                      {contentSegments.length} đoạn
                    </div>
                  </div>

                  {/* Content with advanced styling */}
                  <div className="space-y-3">
                    {renderContentSegments(contentSegments)}
                  </div>

                  {/* Subtle bottom decoration */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryHistoryPanel;
