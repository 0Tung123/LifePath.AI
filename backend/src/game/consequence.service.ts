import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  Consequence,
  ConsequenceSeverity,
} from './entities/consequence.entity';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { GeminiAiService } from './gemini-ai.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

export interface GameContext {
  gameSessionId: string;
  characterId: string;
  currentSituation: string;
  characterDescription: string;
}

export interface ActionConsequence {
  description: string;
  timeToTrigger: 'immediate' | 'short' | 'medium' | 'long';
  severity: ConsequenceSeverity;
  isPermanent: boolean;
  affectedEntities: string[];
}

@Injectable()
export class ConsequenceService {
  constructor(
    @InjectRepository(Consequence)
    private consequenceRepository: Repository<Consequence>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private geminiAiService: GeminiAiService,
    private memoryService: MemoryService,
  ) {}

  async evaluateActionConsequences(
    action: string,
    gameContext: GameContext,
  ): Promise<ActionConsequence[]> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameContext.gameSessionId },
      relations: ['character', 'currentStoryNode'],
    });

    if (!gameSession) {
      throw new Error('Game session not found');
    }

    const prompt = `
      Based on the player's action, generate 1-3 realistic consequences that might occur
      in the game world. These should follow naturally from the action and the current
      situation. Consequences can be immediate or delayed, positive or negative, and
      affect different entities in the game world.
      
      Action: ${action}
      Current situation: ${gameContext.currentSituation}
      Character: ${gameContext.characterDescription}
      
      Return your response in JSON format:
      [
        {
          "description": "Detailed description of the consequence",
          "timeToTrigger": "immediate/short/medium/long",
          "severity": "minor/moderate/major/critical",
          "isPermanent": true/false,
          "affectedEntities": ["entity1", "entity2"]
        }
      ]
    `;

    const aiResponse = await this.geminiAiService.generateContent(prompt);
    let consequences: ActionConsequence[];

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        consequences = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }

    // Save consequences to database
    for (const consequence of consequences) {
      // Calculate trigger time
      const triggerTime = this.calculateTriggerTime(consequence.timeToTrigger);

      // Create and save consequence
      await this.consequenceRepository.save({
        gameSessionId: gameContext.gameSessionId,
        characterId: gameContext.characterId,
        description: consequence.description,
        triggerTime,
        severity: consequence.severity,
        isPermanent: consequence.isPermanent,
        affectedEntities: consequence.affectedEntities,
        isTriggered: consequence.timeToTrigger === 'immediate',
        sourceActionId: 'manual-action', // Use a default value instead of null
        metadata: {
          originalAction: action,
          originalSituation: gameContext.currentSituation,
        },
        createdAt: new Date(),
      });

      // If immediate consequence, create a memory of it
      if (consequence.timeToTrigger === 'immediate') {
        await this.memoryService.createMemory({
          characterId: gameContext.characterId,
          title: `Consequence: ${this.generateConsequenceTitle(consequence)}`,
          content: consequence.description,
          type: MemoryType.CONSEQUENCE,
          importance: this.calculateMemoryImportance(consequence.severity),
        });
      }

      // If immediate consequence, add to game state pending consequences
      if (consequence.timeToTrigger !== 'immediate') {
        if (!gameSession.gameState) {
          gameSession.gameState = {} as any;
        }

        if (!gameSession.gameState.pendingConsequences) {
          gameSession.gameState.pendingConsequences = [];
        }

        gameSession.gameState.pendingConsequences.push(
          this.generateConsequenceTitle(consequence),
        );

        await this.gameSessionRepository.save(gameSession);
      }
    }

    return consequences;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async triggerPendingConsequences() {
    // Find consequences that are due to trigger
    const pendingConsequences = await this.consequenceRepository.find({
      where: {
        isTriggered: false,
        triggerTime: LessThan(new Date()),
      },
      relations: ['gameSession', 'character'],
    });

    for (const consequence of pendingConsequences) {
      // Skip if game session is not active
      if (!consequence.gameSession?.isActive) {
        continue;
      }

      // Mark as triggered
      consequence.isTriggered = true;
      await this.consequenceRepository.save(consequence);

      // Add to character memory
      await this.memoryService.createMemory({
        characterId: consequence.characterId,
        title: `Delayed Consequence: ${this.generateConsequenceTitle(consequence)}`,
        content: consequence.description,
        type: MemoryType.CONSEQUENCE,
        importance: this.calculateMemoryImportance(consequence.severity),
      });

      // Update game state
      const gameSession = consequence.gameSession;
      if (
        gameSession &&
        gameSession.gameState &&
        gameSession.gameState.pendingConsequences
      ) {
        // Remove from pending consequences
        const title = this.generateConsequenceTitle(consequence);
        gameSession.gameState.pendingConsequences =
          gameSession.gameState.pendingConsequences.filter(
            (c) => !c.includes(title),
          );

        await this.gameSessionRepository.save(gameSession);
      }

      // Apply permanent effects if any
      if (consequence.isPermanent) {
        await this.applyPermanentConsequence(consequence);
      }
    }
  }

  private calculateTriggerTime(timeFrame: string): Date {
    const now = new Date();

    switch (timeFrame) {
      case 'immediate':
        return now;
      case 'short':
        // 1-3 hours
        return new Date(
          now.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 2),
        );
      case 'medium':
        // 6-24 hours
        return new Date(
          now.getTime() + 1000 * 60 * 60 * (6 + Math.random() * 18),
        );
      case 'long':
        // 2-7 days
        return new Date(
          now.getTime() + 1000 * 60 * 60 * 24 * (2 + Math.random() * 5),
        );
      default:
        return now;
    }
  }

  private generateConsequenceTitle(
    consequence: Consequence | ActionConsequence,
  ): string {
    // Extract first sentence or up to 50 characters
    const description = consequence.description;
    const firstSentence = description.split(/[.!?]/, 1)[0];

    if (firstSentence.length <= 50) {
      return firstSentence;
    }

    return firstSentence.substring(0, 47) + '...';
  }

  private calculateMemoryImportance(severity: ConsequenceSeverity): number {
    switch (severity) {
      case ConsequenceSeverity.MINOR:
        return 0.3;
      case ConsequenceSeverity.MODERATE:
        return 0.5;
      case ConsequenceSeverity.MAJOR:
        return 0.7;
      case ConsequenceSeverity.CRITICAL:
        return 0.9;
      default:
        return 0.5;
    }
  }

  private async applyPermanentConsequence(
    consequence: Consequence,
  ): Promise<void> {
    // Handle permanent consequences based on severity
    const character = consequence.character;

    if (!character) {
      return;
    }

    // Add permanent consequence flag to character
    if (!character.attributes) {
      character.attributes = {} as any;
    }

    switch (consequence.severity) {
      case ConsequenceSeverity.CRITICAL:
        // Critical consequences might permanently reduce a stat
        if (this.isCombatRelated(consequence.description)) {
          character.attributes.strength = Math.max(
            1,
            character.attributes.strength - 2,
          );
        } else if (this.isMagicRelated(consequence.description)) {
          character.attributes.mana = Math.max(
            10,
            character.attributes.mana - 20,
          );
        } else if (this.isHealthRelated(consequence.description)) {
          character.attributes.health = Math.max(
            10,
            character.attributes.health - 20,
          );
        }
        break;

      case ConsequenceSeverity.MAJOR:
        // Major consequences might cause a minor stat reduction
        if (this.isCombatRelated(consequence.description)) {
          character.attributes.strength = Math.max(
            1,
            character.attributes.strength - 1,
          );
        } else if (this.isMagicRelated(consequence.description)) {
          character.attributes.mana = Math.max(
            10,
            character.attributes.mana - 10,
          );
        } else if (this.isHealthRelated(consequence.description)) {
          character.attributes.health = Math.max(
            10,
            character.attributes.health - 10,
          );
        }
        break;
    }

    // Save character changes
    await this.characterRepository.save(character);
  }

  private isCombatRelated(description: string): boolean {
    const combatTerms = [
      'wound',
      'scar',
      'injury',
      'combat',
      'battle',
      'fight',
      'sword',
      'weapon',
    ];
    return combatTerms.some((term) => description.toLowerCase().includes(term));
  }

  private isMagicRelated(description: string): boolean {
    const magicTerms = [
      'spell',
      'magic',
      'curse',
      'arcane',
      'wizard',
      'sorcery',
      'enchantment',
    ];
    return magicTerms.some((term) => description.toLowerCase().includes(term));
  }

  private isHealthRelated(description: string): boolean {
    const healthTerms = [
      'disease',
      'illness',
      'sickness',
      'health',
      'injury',
      'poison',
      'wound',
    ];
    return healthTerms.some((term) => description.toLowerCase().includes(term));
  }

  async getPendingConsequencesForSession(
    gameSessionId: string,
  ): Promise<Consequence[]> {
    return this.consequenceRepository.find({
      where: {
        gameSessionId,
        isTriggered: false,
      },
      order: {
        triggerTime: 'ASC',
      },
    });
  }
}
