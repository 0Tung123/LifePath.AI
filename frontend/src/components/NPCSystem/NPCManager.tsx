'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  NPCHighlightData,
  NPCTooltipData,
  NPCDetailCardData,
  NPCNotificationData,
} from '@/types/npc.types';
import NPCHighlight from './NPCHighlight';
import NPCTooltip from './NPCTooltip';
import NPCDetailCard from './NPCDetailCard';
import NPCNotification from './NPCNotification';
import { npcService } from '@/services/npc.service';

interface NPCManagerProps {
  gameId: string;
  storyText: string;
  chapterNumber: number;
  isEnabled?: boolean;
  onNPCInteract?: (npcId: string, action: string) => void;
}

/**
 * NPCManager Component
 * Orchestrates all NPC-related UI components and interactions
 * Handles the complete NPC progressive disclosure system
 */
const NPCManager: React.FC<NPCManagerProps> = ({
  gameId,
  storyText,
  chapterNumber,
  isEnabled = true,
  onNPCInteract,
}) => {
  // State management
  const [highlightData, setHighlightData] = useState<NPCHighlightData[]>([]);
  const [tooltipData, setTooltipData] = useState<NPCTooltipData | null>(null);
  const [detailCardData, setDetailCardData] =
    useState<NPCDetailCardData | null>(null);
  const [notifications, setNotifications] = useState<NPCNotificationData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // UI state
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Initialize NPC service when component mounts
  useEffect(() => {
    if (gameId && !isInitialized) {
      npcService
        .initializeForGame(gameId)
        .then(() => {
          setIsInitialized(true);
          // Load existing notifications
          const existingNotifications = npcService.getActiveNotifications();
          setNotifications(existingNotifications);
        })
        .catch((error) => {
          console.error('Failed to initialize NPC service:', error);
        });
    }
  }, [gameId, isInitialized]);

  // Process story content for NPC mentions
  useEffect(() => {
    if (isInitialized && storyText && !isProcessing) {
      setIsProcessing(true);

      npcService
        .processStoryContent(storyText, chapterNumber)
        .then((result) => {
          setHighlightData(result.highlightData);

          // Add new notifications
          if (result.notifications.length > 0) {
            setNotifications((prev) => [...prev, ...result.notifications]);
          }
        })
        .catch((error) => {
          console.error('Failed to process story content:', error);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  }, [isInitialized, storyText, chapterNumber, isProcessing]);

  // Handle NPC hover
  const handleNPCHover = useCallback(
    (npcId: string, event: React.MouseEvent) => {
      if (!isEnabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;

      setTooltipPosition({ x, y });

      const tooltipData = npcService.getNPCTooltipData(npcId, x, y);
      if (tooltipData) {
        setTooltipData(tooltipData);
        setShowTooltip(true);
      }
    },
    [isEnabled],
  );

  // Handle NPC click
  const handleNPCClick = useCallback(
    (npcId: string) => {
      if (!isEnabled) return;

      // Hide tooltip
      setShowTooltip(false);
      setTooltipData(null);

      // Show detail card
      const detailData = npcService.getNPCDetailCardData(npcId);
      if (detailData) {
        setDetailCardData(detailData);
        setShowDetailCard(true);
      }
    },
    [isEnabled],
  );

  // Handle NPC leave (mouse leave)
  const handleNPCLeave = useCallback(() => {
    setShowTooltip(false);
    setTooltipData(null);
  }, []);

  // Handle detail card close
  const handleDetailCardClose = useCallback(() => {
    setShowDetailCard(false);
    setDetailCardData(null);
  }, []);

  // Handle NPC interaction from detail card
  const handleNPCInteraction = useCallback(
    (npcId: string, action: string) => {
      if (onNPCInteract) {
        onNPCInteract(npcId, action);
      }

      // Record the interaction in the service
      npcService.markNPCInteraction(
        npcId,
        action as any,
        `Player initiated ${action}`,
      );

      // Refresh detail card data
      const updatedDetailData = npcService.getNPCDetailCardData(npcId);
      if (updatedDetailData) {
        setDetailCardData(updatedDetailData);
      }
    },
    [onNPCInteract],
  );

  // Handle notification dismiss
  const handleNotificationDismiss = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    npcService.dismissNotification(notificationId);
  }, []);

  // Handle dismiss all notifications
  const handleDismissAllNotifications = useCallback(() => {
    setNotifications([]);
    notifications.forEach((notification) => {
      npcService.dismissNotification(notification.id);
    });
  }, [notifications]);

  // Don't render if not enabled or not initialized
  if (!isEnabled || !isInitialized) {
    return <span>{storyText}</span>;
  }

  return (
    <>
      {/* Highlighted Story Text */}
      <NPCHighlight
        text={storyText}
        npcHighlights={highlightData}
        onNPCHover={handleNPCHover}
        onNPCClick={handleNPCClick}
        onNPCLeave={handleNPCLeave}
      />

      {/* Tooltip */}
      <NPCTooltip
        data={tooltipData}
        visible={showTooltip}
        onClose={handleNPCLeave}
      />

      {/* Detail Card */}
      <NPCDetailCard
        data={detailCardData}
        visible={showDetailCard}
        position="beside-lore"
        onClose={handleDetailCardClose}
        onInteract={handleNPCInteraction}
      />

      {/* Notifications */}
      <NPCNotification
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onDismissAll={handleDismissAllNotifications}
        position="top-right"
      />
    </>
  );
};

export default NPCManager;
