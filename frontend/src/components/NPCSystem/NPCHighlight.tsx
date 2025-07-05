'use client';

import React, { useMemo } from 'react';
import { NPCHighlightProps, NPCHighlightData } from '@/types/npc.types';

/**
 * NPCHighlight Component
 * Highlights NPC names in text with appropriate styling based on discovery stage
 * Supports hover and click interactions for progressive disclosure
 */
const NPCHighlight: React.FC<NPCHighlightProps> = ({
  text,
  npcHighlights,
  onNPCHover,
  onNPCClick,
  onNPCLeave,
}) => {
  // Sort highlights by position (descending) to process from end to start
  const sortedHighlights = useMemo(() => {
    return [...npcHighlights].sort(
      (a, b) => b.textPosition.start - a.textPosition.start,
    );
  }, [npcHighlights]);

  // Define segment types
  type TextSegment = {
    type: 'text';
    content: string;
    key: string;
  };

  type HighlightSegment = {
    type: 'highlight';
    content: string;
    key: string;
    highlightData: NPCHighlightData;
  };

  type Segment = TextSegment | HighlightSegment;

  // Process text with highlights
  const processedText = useMemo(() => {
    if (!sortedHighlights.length) {
      return [{ type: 'text' as const, content: text, key: 'text-0' }];
    }

    let processedText = text;
    const segments: Segment[] = [];

    // Process highlights from end to start to maintain correct positions
    sortedHighlights.forEach((highlight, index) => {
      const { start, end } = highlight.textPosition;

      // Extract text after this highlight
      const afterText = processedText.substring(end);
      if (afterText) {
        segments.unshift({
          type: 'text' as const,
          content: afterText,
          key: `text-after-${index}`,
        });
      }

      // Add the highlight segment
      segments.unshift({
        type: 'highlight' as const,
        content: processedText.substring(start, end),
        key: `highlight-${index}`,
        highlightData: highlight,
      });

      // Update processed text to exclude the processed part
      processedText = processedText.substring(0, start);
    });

    // Add remaining text at the beginning
    if (processedText) {
      segments.unshift({
        type: 'text' as const,
        content: processedText,
        key: 'text-start',
      });
    }

    return segments;
  }, [text, sortedHighlights]);

  // Get highlight styles based on highlight type
  const getHighlightStyles = (
    highlightType: NPCHighlightData['highlightType'],
  ) => {
    const baseStyles =
      'relative cursor-pointer transition-all duration-200 ease-in-out';

    switch (highlightType) {
      case 'first-mention':
        return `${baseStyles} text-amber-300 bg-amber-900/30 border-b-2 border-amber-400 shadow-sm hover:bg-amber-900/50 hover:shadow-md`;
      case 'subsequent-mention':
        return `${baseStyles} text-blue-300 bg-blue-900/20 border-b border-blue-400 hover:bg-blue-900/40`;
      case 'important-update':
        return `${baseStyles} text-purple-300 bg-purple-900/30 border-b-2 border-purple-400 shadow-sm hover:bg-purple-900/50 animate-pulse`;
      default:
        return `${baseStyles} text-gray-300 bg-gray-900/20 border-b border-gray-400 hover:bg-gray-900/40`;
    }
  };

  // Get highlight icon based on type
  const getHighlightIcon = (
    highlightType: NPCHighlightData['highlightType'],
  ) => {
    switch (highlightType) {
      case 'first-mention':
        return (
          <svg
            className="w-3 h-3 text-amber-400 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              display: 'inline-block',
              marginLeft: '2px',
              verticalAlign: 'middle',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'important-update':
        return (
          <svg
            className="w-3 h-3 text-purple-400 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              display: 'inline-block',
              marginLeft: '2px',
              verticalAlign: 'middle',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    highlightData: NPCHighlightData,
  ) => {
    event.stopPropagation();
    onNPCHover(highlightData.npcId, event);
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    event.stopPropagation();
    onNPCLeave();
  };

  const handleClick = (
    event: React.MouseEvent,
    highlightData: NPCHighlightData,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    onNPCClick(highlightData.npcId);
  };

  return (
    <span className="inline">
      {processedText.map((segment) => {
        if (segment.type === 'text') {
          return (
            <span key={segment.key} className="inline">
              {segment.content}
            </span>
          );
        } else if (segment.type === 'highlight' && segment.highlightData) {
          const { highlightData } = segment;
          return (
            <span
              key={segment.key}
              className={getHighlightStyles(highlightData.highlightType)}
              onMouseEnter={(e) => handleMouseEnter(e, highlightData)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(e, highlightData)}
              title={`${highlightData.name} - Click để xem thông tin chi tiết`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNPCClick(highlightData.npcId);
                }
              }}
            >
              {segment.content}
              {getHighlightIcon(highlightData.highlightType)}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
};

export default NPCHighlight;
