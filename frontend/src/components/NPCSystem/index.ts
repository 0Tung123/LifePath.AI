// NPCSystem Components Export
export { default as NPCHighlight } from './NPCHighlight';
export { default as NPCTooltip } from './NPCTooltip';
export { default as NPCDetailCard } from './NPCDetailCard';
export { default as NPCNotification } from './NPCNotification';
export { default as NPCManager } from './NPCManager';

// Re-export types for convenience
export type {
  NPCState,
  NPCInteraction,
  NPCHighlightData,
  NPCTooltipData,
  NPCDetailCardData,
  NPCNotificationData,
  NPCTrackingService,
  NPCSystemConfig,
} from '@/types/npc.types';

// Re-export service
export { npcService } from '@/services/npc.service';
