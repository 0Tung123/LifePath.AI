import {
  NPCState,
  NPCInteraction,
  NPCHighlightData,
  NPCTooltipData,
  NPCDetailCardData,
  NPCNotificationData,
  NPCTrackingService,
  NPCBackendData,
  NPCUpdateRequest,
  NPCInteractionRequest,
  NPCStoryProcessingResult,
} from '@/types/npc.types';
import api from './api';

class NPCService implements NPCTrackingService {
  private npcs: Map<string, NPCState> = new Map();
  private interactions: Map<string, NPCInteraction[]> = new Map();
  private notifications: NPCNotificationData[] = [];
  private gameId: string | null = null;

  // Initialize service with game data
  async initializeForGame(gameId: string): Promise<void> {
    this.gameId = gameId;
    try {
      const response = await api.get<NPCBackendData[]>(`/games/${gameId}/npcs`);
      this.loadNPCData(response.data);
    } catch (error) {
      console.error('Failed to load NPC data:', error);
    }
  }

  // Load NPC data from backend
  private loadNPCData(backendData: NPCBackendData[]): void {
    this.npcs.clear();
    this.interactions.clear();

    backendData.forEach((data) => {
      const npcState: NPCState = {
        id: data.id,
        name: data.name,
        description: data.description,
        discoveryStage: data.discoveryStage,
        firstMentionedAt: data.firstMentionedAt,
        firstInteractionAt: data.firstInteractionAt,
        totalInteractions: data.totalInteractions,
        relationshipStatus: data.relationshipStatus,
        relationshipScore: data.relationshipScore,
        knownAttributes: data.knownAttributes,
        hiddenAttributes: data.hiddenAttributes,
        lastSeenAt: data.lastSeenAt,
        lastSeenChapter: data.lastSeenChapter,
        currentStatus: data.currentStatus,
        importance: data.importance,
        faction: data.faction,
        role: data.role,
        loreData: data.loreData,
      };

      this.npcs.set(data.id, npcState);
      this.interactions.set(data.id, []); // Will be loaded separately if needed
    });
  }

  // Process new story content for NPC mentions
  async processStoryContent(
    content: string,
    chapterNumber: number,
  ): Promise<NPCStoryProcessingResult> {
    const result: NPCStoryProcessingResult = {
      highlightData: [],
      notifications: [],
      updatedNPCs: [],
      newInteractions: [],
    };

    // Extract NPC mentions from content
    const npcMentions = this.extractNPCMentions(content);

    for (const mention of npcMentions) {
      const npc = this.findNPCByName(mention.name);
      if (npc) {
        // Update existing NPC
        const wasFirstMention = npc.discoveryStage === 'hidden';
        if (wasFirstMention) {
          npc.discoveryStage = 'mentioned';
          npc.firstMentionedAt = new Date().toISOString();

          // Create notification for first mention
          const notification = this.createNotificationForNPC(
            npc.id,
            'discovery',
            'Nhân vật mới khám phá',
            `Bạn đã gặp ${npc.name} lần đầu tiên!`,
          );
          result.notifications.push(notification);
        }

        // Add highlight data
        result.highlightData.push({
          npcId: npc.id,
          name: npc.name,
          textPosition: mention.position,
          highlightType: wasFirstMention
            ? 'first-mention'
            : 'subsequent-mention',
          shouldHighlight: true,
        });

        // Record interaction
        const interaction = this.recordInteraction(
          npc.id,
          'mentioned',
          mention.context,
          chapterNumber,
        );
        result.newInteractions.push(interaction);
        result.updatedNPCs.push(npc);
      }
    }

    // Sync with backend
    await this.syncWithBackend(result);

    return result;
  }

  // Extract NPC mentions from text
  private extractNPCMentions(content: string): Array<{
    name: string;
    position: { start: number; end: number };
    context: string;
  }> {
    const mentions: Array<{
      name: string;
      position: { start: number; end: number };
      context: string;
    }> = [];

    // Get all known NPC names
    const npcNames = Array.from(this.npcs.values()).map((npc) => npc.name);

    npcNames.forEach((name) => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Get context (50 chars before and after)
        const contextStart = Math.max(0, start - 50);
        const contextEnd = Math.min(content.length, end + 50);
        const context = content.substring(contextStart, contextEnd);

        mentions.push({
          name: match[0],
          position: { start, end },
          context,
        });
      }
    });

    return mentions;
  }

  // Find NPC by name (case insensitive)
  private findNPCByName(name: string): NPCState | null {
    for (const npc of this.npcs.values()) {
      if (npc.name.toLowerCase() === name.toLowerCase()) {
        return npc;
      }
    }
    return null;
  }

  // Record NPC interaction
  private recordInteraction(
    npcId: string,
    interactionType: NPCInteraction['interactionType'],
    context: string,
    chapterNumber: number,
  ): NPCInteraction {
    const interaction: NPCInteraction = {
      id: `${npcId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      npcId,
      chapterNumber,
      interactionType,
      context,
      timestamp: new Date().toISOString(),
      relationshipChange: 0,
      discoveredAttributes: [],
    };

    // Add to interactions map
    if (!this.interactions.has(npcId)) {
      this.interactions.set(npcId, []);
    }
    this.interactions.get(npcId)!.push(interaction);

    // Update NPC total interactions
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.totalInteractions++;
      if (!npc.firstInteractionAt) {
        npc.firstInteractionAt = interaction.timestamp;
      }
    }

    return interaction;
  }

  // Create notification for NPC
  private createNotificationForNPC(
    npcId: string,
    type: NPCNotificationData['type'],
    title: string,
    message: string,
  ): NPCNotificationData {
    const notification: NPCNotificationData = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      npcId,
      npcName: this.npcs.get(npcId)?.name || 'Unknown',
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      autoClose: true,
      autoCloseDelay: 5000,
    };

    this.notifications.push(notification);
    return notification;
  }

  // Sync with backend
  private async syncWithBackend(
    result: NPCStoryProcessingResult,
  ): Promise<void> {
    if (!this.gameId) return;

    try {
      // Update NPCs
      for (const npc of result.updatedNPCs) {
        const updateRequest: NPCUpdateRequest = {
          npcId: npc.id,
          updates: {
            discoveryStage: npc.discoveryStage,
            relationshipStatus: npc.relationshipStatus,
            relationshipScore: npc.relationshipScore,
            knownAttributes: npc.knownAttributes,
            currentStatus: npc.currentStatus,
            lastSeenAt: npc.lastSeenAt,
            lastSeenChapter: npc.lastSeenChapter,
          },
        };

        await api.patch(`/games/${this.gameId}/npcs/${npc.id}`, updateRequest);
      }

      // Record interactions
      for (const interaction of result.newInteractions) {
        const interactionRequest: NPCInteractionRequest = {
          npcId: interaction.npcId,
          interactionType: interaction.interactionType,
          context: interaction.context,
          chapterNumber: interaction.chapterNumber,
          relationshipChange: interaction.relationshipChange,
          discoveredAttributes: interaction.discoveredAttributes,
        };

        await api.post(
          `/games/${this.gameId}/npcs/${interaction.npcId}/interactions`,
          interactionRequest,
        );
      }
    } catch (error) {
      console.error('Failed to sync NPC data with backend:', error);
    }
  }

  // Interface implementation
  markNPCMentioned(
    npcName: string,
    context: string,
    chapterNumber: number,
  ): void {
    const npc = this.findNPCByName(npcName);
    if (npc && npc.discoveryStage === 'hidden') {
      npc.discoveryStage = 'mentioned';
      npc.firstMentionedAt = new Date().toISOString();
      this.recordInteraction(npc.id, 'mentioned', context, chapterNumber);
    }
  }

  markNPCInteraction(
    npcId: string,
    interactionType: NPCInteraction['interactionType'],
    context: string,
  ): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      this.recordInteraction(npcId, interactionType, context, 0); // Chapter will be set from current game state

      // Progress discovery stage
      if (npc.discoveryStage === 'mentioned' && npc.totalInteractions >= 3) {
        npc.discoveryStage = 'detailed';
      } else if (
        npc.discoveryStage === 'detailed' &&
        npc.totalInteractions >= 10
      ) {
        npc.discoveryStage = 'familiar';
      }
    }
  }

  getNPCState(npcId: string): NPCState | null {
    return this.npcs.get(npcId) || null;
  }

  getAllNPCs(): NPCState[] {
    return Array.from(this.npcs.values());
  }

  getHighlightDataForText(text: string): NPCHighlightData[] {
    return this.extractNPCMentions(text).map((mention) => {
      const npc = this.findNPCByName(mention.name);
      return {
        npcId: npc?.id || '',
        name: mention.name,
        textPosition: mention.position,
        highlightType:
          npc?.discoveryStage === 'mentioned'
            ? 'first-mention'
            : 'subsequent-mention',
        shouldHighlight: !!npc,
      };
    });
  }

  updateRelationship(npcId: string, change: number, reason: string): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.relationshipScore += change;
      npc.relationshipScore = Math.max(
        -100,
        Math.min(100, npc.relationshipScore),
      );

      // Update relationship status based on score
      if (npc.relationshipScore >= 80) npc.relationshipStatus = 'ally';
      else if (npc.relationshipScore >= 50) npc.relationshipStatus = 'friend';
      else if (npc.relationshipScore >= 20)
        npc.relationshipStatus = 'acquaintance';
      else if (npc.relationshipScore >= -20)
        npc.relationshipStatus = 'stranger';
      else if (npc.relationshipScore >= -50) npc.relationshipStatus = 'rival';
      else npc.relationshipStatus = 'enemy';

      // Create notification for significant changes
      if (Math.abs(change) >= 10) {
        this.createNotificationForNPC(
          npcId,
          'relationship-change',
          'Mối quan hệ thay đổi',
          `Mối quan hệ với ${npc.name} đã ${change > 0 ? 'cải thiện' : 'xấu đi'}: ${reason}`,
        );
      }
    }
  }

  revealNPCAttribute(npcId: string, attribute: string): void {
    const npc = this.npcs.get(npcId);
    if (npc && npc.hiddenAttributes.includes(attribute)) {
      npc.hiddenAttributes = npc.hiddenAttributes.filter(
        (attr) => attr !== attribute,
      );
      npc.knownAttributes.push(attribute);

      this.createNotificationForNPC(
        npcId,
        'discovery',
        'Khám phá mới',
        `Bạn đã khám phá thêm về ${npc.name}: ${attribute}`,
      );
    }
  }

  createNotification(
    npcId: string,
    type: NPCNotificationData['type'],
    title: string,
    message: string,
  ): void {
    this.createNotificationForNPC(npcId, type, title, message);
  }

  getActiveNotifications(): NPCNotificationData[] {
    return this.notifications;
  }

  dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId,
    );
  }

  // Helper methods for UI components
  getNPCTooltipData(
    npcId: string,
    x: number,
    y: number,
  ): NPCTooltipData | null {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    const relationshipStatusColor = this.getRelationshipColor(
      npc.relationshipStatus,
    );
    const relationshipText = this.getRelationshipText(npc.relationshipStatus);

    return {
      npcId,
      name: npc.name,
      quickDescription: npc.description,
      relationshipStatus: relationshipText,
      relationshipStatusColor,
      lastInteraction: npc.lastSeenAt,
      position: { x, y },
    };
  }

  getNPCDetailCardData(npcId: string): NPCDetailCardData | null {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    const interactions = this.interactions.get(npcId) || [];

    return {
      npc,
      interactions,
      knownInformation: {
        basic: {
          name: npc.name,
          description: npc.description,
          role: npc.role,
          faction: npc.faction,
        },
        relationship: {
          status: this.getRelationshipText(npc.relationshipStatus),
          score: npc.relationshipScore,
          history: interactions.map(
            (i) => `${i.interactionType}: ${i.context.substring(0, 50)}...`,
          ),
        },
        discovered: {
          attributes: npc.knownAttributes,
          secrets: [], // Can be expanded later
        },
        unknown: {
          hiddenCount: npc.hiddenAttributes.length,
          hints: npc.hiddenAttributes
            .slice(0, 2)
            .map((attr) => `??? ${attr.substring(0, 10)}...`),
        },
      },
      timeline: {
        firstMet: npc.firstMentionedAt || 'Chưa gặp',
        totalInteractions: npc.totalInteractions,
        lastSeen: npc.lastSeenAt || 'Chưa rõ',
        keyEvents: interactions
          .filter((i) => i.interactionType !== 'mentioned')
          .map((i) => `${i.interactionType} tại chương ${i.chapterNumber}`),
      },
    };
  }

  private getRelationshipColor(status: NPCState['relationshipStatus']): string {
    const colors = {
      unknown: '#6B7280',
      stranger: '#9CA3AF',
      acquaintance: '#60A5FA',
      friend: '#34D399',
      ally: '#10B981',
      enemy: '#EF4444',
      rival: '#F59E0B',
      romantic: '#EC4899',
    };
    return colors[status] || '#6B7280';
  }

  private getRelationshipText(status: NPCState['relationshipStatus']): string {
    const texts = {
      unknown: 'Không rõ',
      stranger: 'Người lạ',
      acquaintance: 'Quen biết',
      friend: 'Bạn bè',
      ally: 'Đồng minh',
      enemy: 'Kẻ thù',
      rival: 'Đối thủ',
      romantic: 'Tình cảm',
    };
    return texts[status] || 'Không rõ';
  }
}

// Singleton instance
export const npcService = new NPCService();
export default npcService;
