import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { CharacterDeath } from './entities/character-death.entity';
import { StoryNode } from './entities/story-node.entity';
import { MemoryService } from '../memory/memory.service';
import { GeminiAiService } from './gemini-ai.service';
import { MemoryType } from '../memory/entities/memory-record.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface DeathEvaluationResult {
  died: boolean;
  description?: string;
  lastWords?: string[];
  deathProbability?: number;
  reasoning?: string;
}

@Injectable()
export class PermadeathService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(CharacterDeath)
    private characterDeathRepository: Repository<CharacterDeath>,
    @InjectRepository(StoryNode)
    private storyNodeRepository: Repository<StoryNode>,
    private memoryService: MemoryService,
    private geminiAiService: GeminiAiService,
  ) {}

  async evaluateLethalSituation(
    gameSessionId: string,
    decision: string,
    dangerLevel: number,
  ): Promise<DeathEvaluationResult> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character', 'currentStoryNode'],
    });

    if (!gameSession) {
      throw new Error('Game session not found');
    }

    // If permadeath is not enabled, always return false
    if (!gameSession.permadeathEnabled) {
      return { died: false };
    }

    const character = gameSession.character;
    const currentNode = gameSession.currentStoryNode;

    // Use AI to evaluate if the decision could lead to death
    const prompt = `
      Based on the following situation and the player's decision, evaluate whether this decision
      could realistically lead to the character's death. Be fair but unforgiving - in real life,
      bad decisions in dangerous situations can be fatal.

      Situation: ${currentNode.content}
      Player's decision: ${decision}
      Current danger level: ${dangerLevel}/10
      Character level: ${character.level}
      Character class: ${character.characterClass}
      
      Return your evaluation in JSON format:
      {
        "shouldDie": true/false,
        "deathProbability": 0-1,
        "reasoning": "Detailed reasoning for why this decision leads to death or not",
        "deathDescription": "Detailed and dramatic description of the death if it occurs",
        "lastWords": ["1-3 possible last thoughts or words from the character"]
      }
    `;

    const aiResult = await this.geminiAiService.generateContent(prompt);
    
    interface DeathEvaluation {
      shouldDie: boolean;
      deathProbability: number;
      reasoning: string;
      deathDescription: string;
      lastWords: string[];
    }
    
    let evaluation: DeathEvaluation;

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResult.match(/{[\s\S]*}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return { died: false };
    }

    // Calculate death threshold based on difficulty and character level
    const baseThreshold = this.calculateDeathThreshold(
      character,
      gameSession.difficultyLevel,
    );

    // If death probability exceeds threshold and character has no protection
    if (
      evaluation.deathProbability > baseThreshold &&
      !this.hasProtection(character, gameSession)
    ) {
      await this.executeCharacterDeath(
        gameSession,
        character,
        evaluation.deathDescription,
        evaluation.lastWords,
        currentNode.id,
        decision,
      );

      return {
        died: true,
        description: evaluation.deathDescription,
        lastWords: evaluation.lastWords,
        deathProbability: evaluation.deathProbability,
        reasoning: evaluation.reasoning,
      };
    }

    // If it was a close call (within 0.2 of threshold), record it as a near-death experience
    if (evaluation.deathProbability > baseThreshold - 0.2) {
      await this.recordNearDeathExperience(gameSession, evaluation.reasoning);
    }

    return { died: false };
  }

  private calculateDeathThreshold(
    character: Character,
    difficultyLevel: string,
  ): number {
    // Base threshold varies by difficulty
    let baseThreshold = 0.7; // normal difficulty

    switch (difficultyLevel) {
      case 'easy':
        baseThreshold = 0.85;
        break;
      case 'hard':
        baseThreshold = 0.6;
        break;
      case 'hardcore':
        baseThreshold = 0.5;
        break;
    }

    // Higher level characters get a small bonus to survival
    // but there's always a chance of death
    const levelBonus = Math.min(character.level * 0.01, 0.1); // Max 10% bonus

    return Math.min(baseThreshold - levelBonus, 0.9); // Never more than 90% chance of survival
  }

  private hasProtection(
    character: Character,
    gameSession: GameSession,
  ): boolean {
    // Check for protection items or abilities
    if (character.inventory?.items) {
      const hasProtectionItem = character.inventory.items.some(
        (item) =>
          item.name.toLowerCase().includes('resurrection') ||
          item.name.toLowerCase().includes('protection') ||
          (item.effects && item.effects.preventDeath),
      );

      if (hasProtectionItem) return true;
    }

    // Check for protection abilities
    if (character.specialAbilities) {
      const hasProtectionAbility = character.specialAbilities.some(
        (ability) =>
          ability.name.toLowerCase().includes('survival') ||
          ability.name.toLowerCase().includes('invulnerability'),
      );

      if (hasProtectionAbility) return true;
    }

    return false;
  }

  private async executeCharacterDeath(
    gameSession: GameSession,
    character: Character,
    deathDescription: string,
    lastWords: string[],
    lastNodeId: string,
    lastDecision: string,
  ): Promise<void> {
    // 1. Mark character as dead
    character.isDead = true;
    character.deathDate = new Date();
    await this.characterRepository.save(character);

    // 2. End game session
    gameSession.isActive = false;
    gameSession.endedAt = new Date();
    gameSession.deathReason = deathDescription.substring(0, 100) + '...';
    await this.gameSessionRepository.save(gameSession);

    // 3. Record death in CharacterDeath entity
    const daysSurvived = Math.floor(
      (new Date().getTime() - character.createdAt.getTime()) /
        (1000 * 3600 * 24),
    );

    await this.characterDeathRepository.save({
      characterId: character.id,
      gameSessionId: gameSession.id,
      deathDescription,
      deathCause: await this.extractDeathCause(deathDescription),
      lastNodeId,
      lastDecision,
      lastWords,
      stats: {
        level: character.level,
        daysSurvived,
        questsCompleted: gameSession.gameState?.completedQuests?.length || 0,
        significantChoices: character.survivalStats?.majorDecisionsMade || 0,
      },
      timestamp: new Date(),
    });

    // 4. Create memory of death for potential legacy
    await this.memoryService.createMemory({
      characterId: character.id,
      title: `The Death of ${character.name}`,
      content: deathDescription,
      type: MemoryType.DEATH,
      importance: 1.0, // Maximum importance
    });

    // 5. Generate epitaph
    const epitaph = await this.generateEpitaph(character, deathDescription);
    character.epitaph = epitaph;
    await this.characterRepository.save(character);
  }

  private async recordNearDeathExperience(
    gameSession: GameSession,
    reason: string,
  ): Promise<void> {
    // Update near death experiences counter
    if (!gameSession.gameState) {
      gameSession.gameState = {} as any;
    }

    if (!gameSession.gameState.nearDeathExperiences) {
      gameSession.gameState.nearDeathExperiences = 0;
    }

    gameSession.gameState.nearDeathExperiences++;

    // Update character survival stats
    if (!gameSession.character.survivalStats) {
      gameSession.character.survivalStats = {
        daysSurvived: 0,
        dangerousSituationsOvercome: 0,
        nearDeathExperiences: 0,
        majorDecisionsMade: 0,
      };
    }

    gameSession.character.survivalStats.nearDeathExperiences++;

    // Save changes
    await this.gameSessionRepository.save(gameSession);
    await this.characterRepository.save(gameSession.character);

    // Create memory of near-death experience
    await this.memoryService.createMemory({
      characterId: gameSession.character.id,
      title: `Near Death Experience`,
      content: `You nearly died: ${reason}`,
      type: MemoryType.EXPERIENCE,
      importance: 0.9, // High importance
    });
  }

  private async extractDeathCause(deathDescription: string): Promise<string> {
    const prompt = `
      Extract a brief cause of death (5-10 words) from the following death description.
      Example: "Slain by goblin ambush" or "Fell into lava pit"
      
      Death description:
      ${deathDescription}
      
      Cause of death (keep it brief):
    `;

    return this.geminiAiService
      .generateContent(prompt)
      .then((result) => result.trim())
      .catch(() => 'Unknown cause');
  }

  private async generateEpitaph(
    character: Character,
    deathDescription: string,
  ): Promise<string> {
    const prompt = `
      Create a short, poetic epitaph (15-20 words) for a character who died.
      The epitaph should capture the essence of their life and death.
      
      Character: ${character.name}, ${character.characterClass}
      Death: ${deathDescription}
      
      Epitaph:
    `;

    return this.geminiAiService
      .generateContent(prompt)
      .then((result) => result.trim())
      .catch(
        () => `Here lies ${character.name}, who lived bravely and died boldly.`,
      );
  }

  async calculateCurrentDangerLevel(gameSessionId: string): Promise<number> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['currentStoryNode'],
    });

    if (!gameSession || !gameSession.currentStoryNode) {
      return 0; // No danger if no active session or node
    }

    const prompt = `
      Based on the following situation, calculate a danger level from 0 to 10,
      where 0 is completely safe and 10 is almost certain death.
      
      Situation: ${gameSession.currentStoryNode.content}
      
      Return only a number between 0 and 10.
    `;

    const result = await this.geminiAiService.generateContent(prompt);
    const dangerLevel = parseInt(result.trim(), 10);

    // Validate the result is a number between 0-10
    if (isNaN(dangerLevel) || dangerLevel < 0 || dangerLevel > 10) {
      // Default to medium danger if invalid result
      return 5;
    }

    // Update the game state with current danger level
    if (!gameSession.gameState) {
      gameSession.gameState = {} as any;
    }

    gameSession.gameState.dangerLevel = dangerLevel;
    await this.gameSessionRepository.save(gameSession);

    return dangerLevel;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateSurvivalStats() {
    // Find all active characters
    const activeCharacters = await this.characterRepository.find({
      where: { isDead: false },
    });

    for (const character of activeCharacters) {
      if (!character.survivalStats) {
        character.survivalStats = {
          daysSurvived: 0,
          dangerousSituationsOvercome: 0,
          nearDeathExperiences: 0,
          majorDecisionsMade: 0,
        };
      }

      // Increment days survived
      character.survivalStats.daysSurvived++;

      await this.characterRepository.save(character);
    }
  }
}
