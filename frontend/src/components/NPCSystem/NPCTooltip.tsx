'use client';

import React, { useEffect, useState, useRef } from 'react';
import { NPCTooltipProps } from '@/types/npc.types';

/**
 * NPCTooltip Component
 * Shows quick information about NPC on hover
 * Positioned near the cursor with smart positioning to avoid screen edges
 */
const NPCTooltip: React.FC<NPCTooltipProps> = ({ data, visible, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Update visibility with delay
  useEffect(() => {
    if (visible && data) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 100);
      return () => clearTimeout(timer);
    }
  }, [visible, data]);

  // Update position when data changes
  useEffect(() => {
    if (data && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = data.position.x;
      let y = data.position.y;

      // Adjust horizontal position to stay within screen bounds
      if (x + tooltipRect.width > windowWidth - 20) {
        x = windowWidth - tooltipRect.width - 20;
      }
      if (x < 20) {
        x = 20;
      }

      // Adjust vertical position to stay within screen bounds
      if (y + tooltipRect.height > windowHeight - 20) {
        y = data.position.y - tooltipRect.height - 10;
      }
      if (y < 20) {
        y = 20;
      }

      setPosition({ x, y });
    }
  }, [data]);

  if (!isVisible || !data) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(10px, -50%)',
      }}
    >
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg backdrop-blur-sm p-3 max-w-xs">
        {/* NPC Name and Icon */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex-shrink-0">
            <svg
              className="w-4 h-4 text-amber-400"
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
          <h4 className="text-sm font-semibold text-white truncate">
            {data.name}
          </h4>
        </div>

        {/* Quick Description */}
        <div className="mb-2">
          <p className="text-xs text-gray-300 line-clamp-2">
            {data.quickDescription}
          </p>
        </div>

        {/* Relationship Status */}
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.relationshipStatusColor }}
          />
          <span className="text-xs text-gray-400">
            {data.relationshipStatus}
          </span>
        </div>

        {/* Last Interaction */}
        {data.lastInteraction && (
          <div className="flex items-center space-x-2">
            <svg
              className="w-3 h-3 text-gray-500"
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
            <span className="text-xs text-gray-500">
              Gặp lần cuối: {data.lastInteraction}
            </span>
          </div>
        )}

        {/* Action Hint */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500 italic">
            Click để xem thông tin chi tiết
          </p>
        </div>

        {/* Tooltip Arrow */}
        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
          <div className="w-2 h-2 bg-gray-800 border-l border-b border-gray-600 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default NPCTooltip;
