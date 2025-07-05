// NPC System Types - Progressive Disclosure Pattern
export interface NPCState {
  id: string;
  name: string;
  description: string;

  // Tracking states
  discoveryStage: 'hidden' | 'mentioned' | 'detailed' | 'familiar';
  firstMentionedAt?: string; // ISO timestamp
  firstInteractionAt?: string; // ISO timestamp
  totalInteractions: number;

  // Relationship data
  relationshipStatus:
    | 'unknown'
    | 'stranger'
    | 'acquaintance'
    | 'friend'
    | 'ally'
    | 'enemy'
    | 'rival'
    | 'romantic';
  relationshipScore: number; // -100 to 100

  // Progressive disclosure data
  knownAttributes: string[]; // What player has discovered
  hiddenAttributes: string[]; // What player hasn't discovered yet

  // Location and context
  lastSeenAt?: string; // Location name
  lastSeenChapter?: number;
  currentStatus: 'active' | 'inactive' | 'missing' | 'deceased';

  // Metadata
  importance: 'minor' | 'major' | 'critical';
  faction?: string;
  role?: string;

  // Original lore data
  loreData: {
    type: 'npc';
    name: string;
    description: string;
    content?: string;
    title?: string;
    additionalInfo?: Record<
      string,
      string | number | boolean | string[] | null
    >;
  };
}

export interface NPCInteraction {
  id: string;
  npcId: string;
  chapterNumber: number;
  interactionType:
    | 'mentioned'
    | 'dialogue'
    | 'combat'
    | 'trade'
    | 'quest'
    | 'observation';
  context: string;
  timestamp: string;
  relationshipChange?: number;
  discoveredAttributes?: string[];
}

export interface NPCHighlightData {
  npcId: string;
  name: string;
  textPosition: {
    start: number;
    end: number;
  };
  highlightType: 'first-mention' | 'subsequent-mention' | 'important-update';
  shouldHighlight: boolean;
}

export interface NPCTooltipData {
  npcId: string;
  name: string;
  quickDescription: string;
  relationshipStatus: string;
  relationshipStatusColor: string;
  lastInteraction?: string;
  position: {
    x: number;
    y: number;
  };
}

export interface NPCDetailCardData {
  npc: NPCState;
  interactions: NPCInteraction[];
  knownInformation: {
    basic: {
      name: string;
      description: string;
      role?: string;
      faction?: string;
    };
    relationship: {
      status: string;
      score: number;
      history: string[];
    };
    discovered: {
      attributes: string[];
      secrets: string[];
    };
    unknown: {
      hiddenCount: number;
      hints: string[];
    };
  };
  timeline: {
    firstMet: string;
    totalInteractions: number;
    lastSeen: string;
    keyEvents: string[];
  };
}

export interface NPCNotificationData {
  id: string;
  npcId: string;
  npcName: string;
  type:
    | 'relationship-change'
    | 'faction-change'
    | 'status-change'
    | 'discovery'
    | 'important-update';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  autoClose: boolean;
  autoCloseDelay?: number; // in milliseconds
}

// Component Props Types
export interface NPCHighlightProps {
  text: string;
  npcHighlights: NPCHighlightData[];
  onNPCHover: (npcId: string, event: React.MouseEvent) => void;
  onNPCClick: (npcId: string) => void;
  onNPCLeave: () => void;
}

export interface NPCTooltipProps {
  data: NPCTooltipData | null;
  visible: boolean;
  onClose: () => void;
}

export interface NPCDetailCardProps {
  data: NPCDetailCardData | null;
  visible: boolean;
  position: 'beside-lore' | 'modal' | 'sidebar';
  onClose: () => void;
  onInteract?: (npcId: string, action: string) => void;
}

export interface NPCNotificationProps {
  notifications: NPCNotificationData[];
  onDismiss: (notificationId: string) => void;
  onDismissAll: () => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Service Types
export interface NPCTrackingService {
  // Discovery tracking
  markNPCMentioned: (
    npcName: string,
    context: string,
    chapterNumber: number,
  ) => void;
  markNPCInteraction: (
    npcId: string,
    interactionType: NPCInteraction['interactionType'],
    context: string,
  ) => void;

  // State queries
  getNPCState: (npcId: string) => NPCState | null;
  getAllNPCs: () => NPCState[];
  getHighlightDataForText: (text: string) => NPCHighlightData[];

  // Relationship management
  updateRelationship: (npcId: string, change: number, reason: string) => void;

  // Progressive disclosure
  revealNPCAttribute: (npcId: string, attribute: string) => void;

  // Notifications
  createNotification: (
    npcId: string,
    type: NPCNotificationData['type'],
    title: string,
    message: string,
  ) => void;
  getActiveNotifications: () => NPCNotificationData[];
  dismissNotification: (notificationId: string) => void;
}

// Backend Integration Types
export interface NPCBackendData {
  id: string;
  gameId: string;
  name: string;
  description: string;
  loreData: NPCState['loreData'];
  discoveryStage: NPCState['discoveryStage'];
  relationshipStatus: NPCState['relationshipStatus'];
  relationshipScore: number;
  totalInteractions: number;
  knownAttributes: string[];
  hiddenAttributes: string[];
  firstMentionedAt?: string;
  firstInteractionAt?: string;
  lastSeenAt?: string;
  lastSeenChapter?: number;
  currentStatus: NPCState['currentStatus'];
  importance: NPCState['importance'];
  faction?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NPCUpdateRequest {
  npcId: string;
  updates: Partial<{
    discoveryStage: NPCState['discoveryStage'];
    relationshipStatus: NPCState['relationshipStatus'];
    relationshipScore: number;
    knownAttributes: string[];
    currentStatus: NPCState['currentStatus'];
    lastSeenAt: string;
    lastSeenChapter: number;
  }>;
}

export interface NPCInteractionRequest {
  npcId: string;
  interactionType: NPCInteraction['interactionType'];
  context: string;
  chapterNumber: number;
  relationshipChange?: number;
  discoveredAttributes?: string[];
}

// Story Processing Types
export interface NPCStoryProcessingResult {
  highlightData: NPCHighlightData[];
  notifications: NPCNotificationData[];
  updatedNPCs: NPCState[];
  newInteractions: NPCInteraction[];
}

// Configuration
export interface NPCSystemConfig {
  highlighting: {
    enabled: boolean;
    firstMentionColor: string;
    subsequentMentionColor: string;
    importantUpdateColor: string;
  };
  tooltip: {
    enabled: boolean;
    hoverDelay: number;
    hideDelay: number;
  };
  detailCard: {
    enabled: boolean;
    position: NPCDetailCardProps['position'];
    showUnknownHints: boolean;
  };
  notifications: {
    enabled: boolean;
    position: NPCNotificationProps['position'];
    autoClose: boolean;
    autoCloseDelay: number;
  };
  discovery: {
    attributeRevealThreshold: number; // How many interactions to reveal an attribute
    relationshipChangeThreshold: number; // Minimum change to show notification
  };
}
