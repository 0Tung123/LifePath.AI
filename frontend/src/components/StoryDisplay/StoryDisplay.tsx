import React, { useEffect, useRef, useState } from 'react';
import { StorySegment } from '../../types/game.types';
import './StoryDisplay.css';

export interface StoryDisplayProps {
  storyHistory: StorySegment[];
  currentObjective?: string;
  autoScroll?: boolean;
  onToggleAutoScroll?: () => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storyHistory,
  currentObjective,
  autoScroll = true,
  onToggleAutoScroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (autoScroll && !isUserScrolling && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [storyHistory, autoScroll, isUserScrolling]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      setShowScrollButton(!isNearBottom);

      // Detect if user is manually scrolling
      if (scrollTop + clientHeight < scrollHeight - 50) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsUserScrolling(false);
    }
  };

  const getSegmentIcon = (type: StorySegment['type']): string => {
    switch (type) {
      case 'story':
        return '📖';
      case 'user_choice':
        return '🎯';
      case 'user_custom_action':
        return '⚡';
      case 'user_thinking':
        return '💭';
      case 'user_communication':
        return '💬';
      case 'system':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getSegmentTypeLabel = (type: StorySegment['type']): string => {
    switch (type) {
      case 'story':
        return 'Story';
      case 'user_choice':
        return 'Choice';
      case 'user_custom_action':
        return 'Action';
      case 'user_thinking':
        return 'Thought';
      case 'user_communication':
        return 'Communication';
      case 'system':
        return 'System';
      default:
        return 'Event';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="story-display">
      {/* Header */}
      <div className="story-display__header">
        <div className="story-display__title">
          <h2>📚 Story</h2>
          <span className="story-display__count">
            {storyHistory.length}{' '}
            {storyHistory.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="story-display__controls">
          <button
            className={`story-display__auto-scroll ${autoScroll ? 'active' : ''}`}
            onClick={onToggleAutoScroll}
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            {autoScroll ? '📌' : '📍'}
          </button>
        </div>
      </div>

      {/* Current Objective */}
      {currentObjective && (
        <div className="story-display__objective">
          <div className="objective-header">
            <span className="objective-icon">🎯</span>
            <span className="objective-label">Current Objective</span>
          </div>
          <p className="objective-text">{currentObjective}</p>
        </div>
      )}

      {/* Story Content */}
      <div ref={containerRef} className="story-display__content">
        {storyHistory.length === 0 ? (
          <div className="story-display__empty">
            <p>📖 Your story will appear here as you play...</p>
          </div>
        ) : (
          storyHistory.map((segment, index) => (
            <div
              key={index}
              className={`story-segment story-segment--${segment.type}`}
            >
              <div className="story-segment__header">
                <div className="story-segment__meta">
                  <span className="story-segment__icon">
                    {getSegmentIcon(segment.type)}
                  </span>
                  <span className="story-segment__type">
                    {getSegmentTypeLabel(segment.type)}
                  </span>
                </div>
                <span className="story-segment__timestamp">
                  {formatTimestamp(segment.timestamp)}
                </span>
              </div>

              <div className="story-segment__content">
                <p>{segment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          className="story-display__scroll-button"
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          ⬇️
        </button>
      )}
    </div>
  );
};

export default StoryDisplay;
