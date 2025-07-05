import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NPC, NPCInteraction, NPCNotification } from '../entities/npc.entity';
import { Game } from '../entities/game.entity';
import {
  CreateNPCDto,
  UpdateNPCDto,
  CreateNPCInteractionDto,
  NPCBatchUpdateDto,
  NPCDiscoveryStage,
  NPCRelationshipStatus,
  NPCImportance,
} from '../dto/npc.dto';
import { LoreFragment } from '../interfaces/game-content.interface';

@Injectable()
export class NPCService {
  constructor(
    @InjectRepository(NPC)
    private npcRepository: Repository<NPC>,
    @InjectRepository(NPCInteraction)
    private npcInteractionRepository: Repository<NPCInteraction>,
    @InjectRepository(NPCNotification)
    private npcNotificationRepository: Repository<NPCNotification>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  // Create NPC
  async createNPC(
    gameId: string,
    userId: string,
    createNPCDto: CreateNPCDto,
  ): Promise<NPC> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Check if NPC with same name already exists
    const existingNPC = await this.npcRepository.findOne({
      where: { gameId, name: createNPCDto.name },
    });
    if (existingNPC) {
      throw new ForbiddenException('NPC with this name already exists');
    }

    const npc = this.npcRepository.create({
      gameId,
      ...createNPCDto,
      knownAttributes: createNPCDto.knownAttributes || [],
      hiddenAttributes: createNPCDto.hiddenAttributes || [],
    });

    return this.npcRepository.save(npc);
  }

  // Get all NPCs for a game
  async getNPCsByGame(gameId: string, userId: string): Promise<NPC[]> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.npcRepository.find({
      where: { gameId },
      relations: ['interactions'],
      order: {
        importance: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  // Get single NPC
  async getNPC(gameId: string, npcId: string, userId: string): Promise<NPC> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const npc = await this.npcRepository.findOne({
      where: { id: npcId, gameId },
      relations: ['interactions'],
    });

    if (!npc) {
      throw new NotFoundException('NPC not found');
    }

    return npc;
  }

  // Update NPC
  async updateNPC(
    gameId: string,
    npcId: string,
    userId: string,
    updateNPCDto: UpdateNPCDto,
  ): Promise<NPC> {
    const npc = await this.getNPC(gameId, npcId, userId);

    Object.assign(npc, updateNPCDto);

    // Ensure relationship score is within bounds
    if (npc.relationshipScore < -100) npc.relationshipScore = -100;
    if (npc.relationshipScore > 100) npc.relationshipScore = 100;

    return this.npcRepository.save(npc);
  }

  // Delete NPC
  async deleteNPC(
    gameId: string,
    npcId: string,
    userId: string,
  ): Promise<void> {
    const npc = await this.getNPC(gameId, npcId, userId);
    await this.npcRepository.remove(npc);
  }

  // Create NPC Interaction
  async createNPCInteraction(
    gameId: string,
    npcId: string,
    userId: string,
    createInteractionDto: CreateNPCInteractionDto,
  ): Promise<NPCInteraction> {
    const npc = await this.getNPC(gameId, npcId, userId);

    const interaction = this.npcInteractionRepository.create({
      npcId,
      gameId,
      ...createInteractionDto,
      discoveredAttributes: createInteractionDto.discoveredAttributes || [],
    });

    const savedInteraction =
      await this.npcInteractionRepository.save(interaction);

    // Update NPC stats
    npc.totalInteractions++;
    if (!npc.firstInteractionAt) {
      npc.firstInteractionAt = new Date();
    }

    // Update relationship score
    if (createInteractionDto.relationshipChange) {
      npc.relationshipScore += createInteractionDto.relationshipChange;
      npc.relationshipScore = Math.max(
        -100,
        Math.min(100, npc.relationshipScore),
      );

      // Update relationship status based on score
      npc.relationshipStatus = this.getRelationshipStatusFromScore(
        npc.relationshipScore,
      );
    }

    // Update discovery stage
    if (npc.discoveryStage === 'hidden') {
      npc.discoveryStage = 'mentioned';
      npc.firstMentionedAt = new Date();
    } else if (
      npc.discoveryStage === 'mentioned' &&
      npc.totalInteractions >= 3
    ) {
      npc.discoveryStage = 'detailed';
    } else if (
      npc.discoveryStage === 'detailed' &&
      npc.totalInteractions >= 10
    ) {
      npc.discoveryStage = 'familiar';
    }

    // Reveal discovered attributes
    if (
      createInteractionDto.discoveredAttributes &&
      createInteractionDto.discoveredAttributes.length > 0
    ) {
      createInteractionDto.discoveredAttributes.forEach((attr) => {
        if (npc.hiddenAttributes.includes(attr)) {
          npc.hiddenAttributes = npc.hiddenAttributes.filter(
            (hiddenAttr) => hiddenAttr !== attr,
          );
          npc.knownAttributes.push(attr);
        }
      });
    }

    await this.npcRepository.save(npc);

    return savedInteraction;
  }

  // Get NPC Interactions
  async getNPCInteractions(
    gameId: string,
    npcId: string,
    userId: string,
  ): Promise<NPCInteraction[]> {
    await this.getNPC(gameId, npcId, userId); // Verify access

    return this.npcInteractionRepository.find({
      where: { npcId, gameId },
      order: { createdAt: 'ASC' },
    });
  }

  // Batch update NPCs (for AI story processing)
  async batchUpdateNPCs(
    gameId: string,
    userId: string,
    batchUpdateDto: NPCBatchUpdateDto,
  ): Promise<NPC[]> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const updatedNPCs: NPC[] = [];

    for (const { npcId, updates } of batchUpdateDto.updates) {
      const npc = await this.npcRepository.findOne({
        where: { id: npcId, gameId },
      });
      if (npc) {
        Object.assign(npc, updates);

        // Ensure relationship score is within bounds
        if (npc.relationshipScore < -100) npc.relationshipScore = -100;
        if (npc.relationshipScore > 100) npc.relationshipScore = 100;

        const updatedNPC = await this.npcRepository.save(npc);
        updatedNPCs.push(updatedNPC);
      }
    }

    return updatedNPCs;
  }

  // Process lore fragments from AI and create/update NPCs
  async processLoreFragments(
    gameId: string,
    userId: string,
    loreFragments: LoreFragment[],
  ): Promise<NPC[]> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const processedNPCs: NPC[] = [];

    for (const fragment of loreFragments) {
      if (fragment.type === 'npc' && fragment.name) {
        let npc = await this.npcRepository.findOne({
          where: { gameId, name: fragment.name },
        });

        if (!npc) {
          // Create new NPC
          const createNPCDto: CreateNPCDto = {
            name: fragment.name,
            description: fragment.description || '',
            loreData: fragment,
            discoveryStage: NPCDiscoveryStage.HIDDEN,
            relationshipStatus: NPCRelationshipStatus.UNKNOWN,
            relationshipScore: 0,
            knownAttributes: this.extractKnownAttributes(fragment),
            hiddenAttributes: this.extractHiddenAttributes(fragment),
            role: fragment.role,
            faction: fragment.faction,
            importance:
              (fragment.importance as NPCImportance) || NPCImportance.MINOR,
          };

          npc = await this.createNPC(gameId, userId, createNPCDto);
        } else {
          // Update existing NPC
          npc.description = fragment.description || npc.description;
          npc.loreData = { ...npc.loreData, ...fragment };
          npc.role = fragment.role || npc.role;
          npc.faction = fragment.faction || npc.faction;
          npc.importance =
            (fragment.importance as NPCImportance) || npc.importance;

          // Merge attributes
          const newKnownAttributes = this.extractKnownAttributes(fragment);
          const newHiddenAttributes = this.extractHiddenAttributes(fragment);

          npc.knownAttributes = [
            ...new Set([...npc.knownAttributes, ...newKnownAttributes]),
          ];
          npc.hiddenAttributes = [
            ...new Set([...npc.hiddenAttributes, ...newHiddenAttributes]),
          ];

          await this.npcRepository.save(npc);
        }

        processedNPCs.push(npc);
      }
    }

    return processedNPCs;
  }

  // Create NPC Notification
  async createNPCNotification(
    gameId: string,
    npcId: string,
    userId: string,
    type: NPCNotification['type'],
    title: string,
    message: string,
    priority: NPCNotification['priority'] = 'medium',
  ): Promise<NPCNotification> {
    const npc = await this.getNPC(gameId, npcId, userId);

    const notification = this.npcNotificationRepository.create({
      gameId,
      npcId,
      npcName: npc.name,
      type,
      title,
      message,
      priority,
    });

    return this.npcNotificationRepository.save(notification);
  }

  // Get NPC Notifications
  async getNPCNotifications(
    gameId: string,
    userId: string,
  ): Promise<NPCNotification[]> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.npcNotificationRepository.find({
      where: { gameId, isRead: false },
      order: {
        priority: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  // Mark notification as read
  async markNotificationAsRead(
    gameId: string,
    notificationId: string,
    userId: string,
  ): Promise<void> {
    // Verify game ownership
    const game = await this.gameRepository.findOne({
      where: { id: gameId, userId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const notification = await this.npcNotificationRepository.findOne({
      where: { id: notificationId, gameId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.npcNotificationRepository.save(notification);
  }

  // Helper methods
  private getRelationshipStatusFromScore(
    score: number,
  ): NPC['relationshipStatus'] {
    if (score >= 80) return 'ally';
    if (score >= 50) return 'friend';
    if (score >= 20) return 'acquaintance';
    if (score >= -20) return 'stranger';
    if (score >= -50) return 'rival';
    return 'enemy';
  }

  private extractKnownAttributes(fragment: LoreFragment): string[] {
    const attributes: string[] = [];

    if (fragment.KnownAttributes) {
      return fragment.KnownAttributes.split('|').map((attr: string) =>
        attr.trim(),
      );
    }

    // Default extraction from basic info
    if (fragment.role) attributes.push(`Role: ${fragment.role}`);
    if (fragment.faction) attributes.push(`Faction: ${fragment.faction}`);

    return attributes;
  }

  private extractHiddenAttributes(fragment: LoreFragment): string[] {
    if (fragment.HiddenAttributes) {
      return fragment.HiddenAttributes.split('|').map((attr: string) =>
        attr.trim(),
      );
    }

    return [];
  }
}
