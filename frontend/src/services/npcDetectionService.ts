'use client';

import { GameStats, NpcInfo, LoreFragment } from '@/types/shared';

export interface NPCDetectionResult {
  newNPCs: (NpcInfo | LoreFragment)[];
  updatedNPCs: (NpcInfo | LoreFragment)[];
  removedNPCs: (NpcInfo | LoreFragment)[];
}

export class NPCDetectionService {
  private static instance: NPCDetectionService;
  private previousGameState: GameStats | null = null;
  private npcCache: Map<string, NpcInfo | LoreFragment> = new Map();

  static getInstance(): NPCDetectionService {
    if (!NPCDetectionService.instance) {
      NPCDetectionService.instance = new NPCDetectionService();
    }
    return NPCDetectionService.instance;
  }

  /**
   * Detects changes in NPCs between game states
   */
  detectNPCChanges(currentGameState: GameStats): NPCDetectionResult {
    const result: NPCDetectionResult = {
      newNPCs: [],
      updatedNPCs: [],
      removedNPCs: [],
    };

    if (!this.previousGameState) {
      // First time - all NPCs are new
      result.newNPCs = this.getAllNPCs(currentGameState);
      this.updateCache(currentGameState);
      this.previousGameState = currentGameState;
      return result;
    }

    // Get current NPCs
    const currentNPCs = this.getAllNPCs(currentGameState);
    const previousNPCs = this.getAllNPCs(this.previousGameState);

    // Create lookup maps
    const currentNPCMap = new Map(
      currentNPCs.map((npc) => [this.getNPCId(npc), npc]),
    );
    const previousNPCMap = new Map(
      previousNPCs.map((npc) => [this.getNPCId(npc), npc]),
    );

    // Find new NPCs
    for (const [id, npc] of currentNPCMap) {
      if (!previousNPCMap.has(id)) {
        result.newNPCs.push(npc);
      } else {
        // Check if existing NPC has been updated
        const previousNPC = previousNPCMap.get(id)!;
        if (this.hasNPCChanged(npc, previousNPC)) {
          result.updatedNPCs.push(npc);
        }
      }
    }

    // Find removed NPCs
    for (const [id, npc] of previousNPCMap) {
      if (!currentNPCMap.has(id)) {
        result.removedNPCs.push(npc);
      }
    }

    this.updateCache(currentGameState);
    this.previousGameState = currentGameState;
    return result;
  }

  /**
   * Get all NPCs from both loreFragments and npcsMet
   */
  private getAllNPCs(gameState: GameStats): (NpcInfo | LoreFragment)[] {
    const npcs: (NpcInfo | LoreFragment)[] = [];

    // Add from loreFragments
    if (gameState.loreFragments && Array.isArray(gameState.loreFragments)) {
      const npcLore = (gameState.loreFragments as LoreFragment[]).filter(
        (lore) => lore.type === 'npc',
      );
      npcs.push(...npcLore);
    }

    // Add from npcsMet
    if (gameState.npcsMet && Array.isArray(gameState.npcsMet)) {
      npcs.push(...(gameState.npcsMet as NpcInfo[]));
    }

    return npcs;
  }

  /**
   * Get unique identifier for an NPC
   */
  private getNPCId(npc: NpcInfo | LoreFragment): string {
    if ('id' in npc && npc.id) return npc.id;
    if ('name' in npc && npc.name) return npc.name;
    if ('title' in npc && npc.title) return npc.title;
    return 'unknown';
  }

  /**
   * Check if NPC has meaningful changes
   */
  private hasNPCChanged(
    current: NpcInfo | LoreFragment,
    previous: NpcInfo | LoreFragment,
  ): boolean {
    // For NpcInfo
    if ('name' in current && 'name' in previous) {
      const currentNPC = current as NpcInfo;
      const previousNPC = previous as NpcInfo;

      return (
        currentNPC.relationship !== previousNPC.relationship ||
        currentNPC.description !== previousNPC.description ||
        currentNPC.location !== previousNPC.location ||
        currentNPC.faction !== previousNPC.faction ||
        currentNPC.role !== previousNPC.role ||
        (currentNPC.interactions || 0) !== (previousNPC.interactions || 0)
      );
    }

    // For LoreFragment
    if ('content' in current && 'content' in previous) {
      const currentLore = current as LoreFragment;
      const previousLore = previous as LoreFragment;

      return (
        currentLore.content !== previousLore.content ||
        currentLore.title !== previousLore.title ||
        currentLore.description !== previousLore.description
      );
    }

    return false;
  }

  /**
   * Update internal cache
   */
  private updateCache(gameState: GameStats): void {
    this.npcCache.clear();
    const allNPCs = this.getAllNPCs(gameState);
    allNPCs.forEach((npc) => {
      this.npcCache.set(this.getNPCId(npc), npc);
    });
  }

  /**
   * Get cached NPC by ID
   */
  getCachedNPC(id: string): NpcInfo | LoreFragment | undefined {
    return this.npcCache.get(id);
  }

  /**
   * Get all cached NPCs
   */
  getAllCachedNPCs(): (NpcInfo | LoreFragment)[] {
    return Array.from(this.npcCache.values());
  }

  /**
   * Clear cache and reset service
   */
  reset(): void {
    this.previousGameState = null;
    this.npcCache.clear();
  }

  /**
   * Get NPC statistics
   */
  getNPCStats(): {
    totalNPCs: number;
    npcInfoCount: number;
    loreFragmentCount: number;
    averageRelationship: number;
    topFactions: string[];
  } {
    const allNPCs = this.getAllCachedNPCs();
    const npcInfos = allNPCs.filter((npc) => 'name' in npc) as NpcInfo[];
    const loreFragments = allNPCs.filter(
      (npc) => 'content' in npc,
    ) as LoreFragment[];

    const relationships = npcInfos
      .map((npc) => npc.relationship || 0)
      .filter((rel) => rel !== undefined);

    const avgRelationship =
      relationships.length > 0
        ? relationships.reduce((sum, rel) => sum + rel, 0) /
          relationships.length
        : 0;

    const factionCounts = npcInfos.reduce(
      (acc, npc) => {
        if (npc.faction) {
          acc[npc.faction] = (acc[npc.faction] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const topFactions = Object.entries(factionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([faction]) => faction);

    return {
      totalNPCs: allNPCs.length,
      npcInfoCount: npcInfos.length,
      loreFragmentCount: loreFragments.length,
      averageRelationship: Math.round(avgRelationship * 100) / 100,
      topFactions,
    };
  }
}

export default NPCDetectionService;
