import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { Legacy, LegacyItem, LegacyKnowledge } from './entities/legacy.entity';
import { CharacterDeath } from './entities/character-death.entity';
import { MemoryService } from '../memory/memory.service';
import { GeminiAiService } from './gemini-ai.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

@Injectable()
export class LegacyService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Legacy)
    private legacyRepository: Repository<Legacy>,
    @InjectRepository(CharacterDeath)
    private characterDeathRepository: Repository<CharacterDeath>,
    private memoryService: MemoryService,
    private geminiAiService: GeminiAiService,
  ) {}

  async createLegacyFromDeadCharacter(characterId: string): Promise<Legacy> {
    const deadCharacter = await this.characterRepository.findOne({
      where: { id: characterId, isDead: true },
    });

    if (!deadCharacter) {
      throw new Error('Character not found or is not dead');
    }

    // Get death information
    const characterDeath = await this.characterDeathRepository.findOne({
      where: { characterId },
      order: { timestamp: 'DESC' },
    });

    // Select inheritable items
    const legacyItems = await this.selectInheritableItems(deadCharacter);

    // Extract knowledge from memories
    const legacyKnowledge = await this.extractCharacterKnowledge(deadCharacter);

    // Generate legacy description
    const legacyDescription = await this.generateLegacyDescription(
      deadCharacter,
      characterDeath?.deathDescription,
    );

    // Calculate bonuses based on character achievements
    const bonuses = this.calculateLegacyBonuses(
      deadCharacter,
      characterDeath || undefined,
    );

    // Create and save legacy
    const legacy = this.legacyRepository.create({
      originCharacterId: characterId,
      name: `Legacy of ${deadCharacter.name}`,
      description: legacyDescription,
      items: legacyItems,
      knowledge: legacyKnowledge,
      deathId: characterDeath?.id,
      bonuses,
      isInherited: false,
      createdAt: new Date(),
    });

    const savedLegacy = await this.legacyRepository.save(legacy);

    // Update character with legacy ID
    deadCharacter.legacyId = savedLegacy.id;
    await this.characterRepository.save(deadCharacter);

    return savedLegacy;
  }

  async applyLegacyToNewCharacter(
    legacyId: string,
    newCharacterId: string,
  ): Promise<void> {
    const legacy = await this.legacyRepository.findOne({
      where: { id: legacyId, isInherited: false },
    });

    if (!legacy) {
      throw new Error('Legacy not found or already inherited');
    }

    const newCharacter = await this.characterRepository.findOne({
      where: { id: newCharacterId, isDead: false },
    });

    if (!newCharacter) {
      throw new Error('Target character not found or is dead');
    }

    // Apply inheritable items to new character
    this.applyLegacyItems(newCharacter, legacy.items);

    // Apply knowledge to new character's memory
    await this.applyLegacyKnowledge(newCharacter.id, legacy.knowledge);

    // Apply stat bonuses
    this.applyLegacyBonuses(newCharacter, legacy.bonuses);

    // Mark legacy as inherited
    legacy.isInherited = true;
    legacy.inheritorCharacterId = newCharacterId;
    await this.legacyRepository.save(legacy);

    // Create memory of inheritance
    await this.memoryService.createMemory({
      characterId: newCharacter.id,
      title: `Inherited Legacy of ${legacy.name}`,
      content: legacy.description,
      type: MemoryType.LEGACY,
      importance: 1.0,
    });

    // Save character changes
    await this.characterRepository.save(newCharacter);
  }

  private async selectInheritableItems(
    character: Character,
  ): Promise<LegacyItem[]> {
    if (!character.inventory?.items || character.inventory.items.length === 0) {
      return [];
    }

    // Filter for rare and significant items
    const significantItems = character.inventory.items.filter((item) => {
      // Check for rarity
      if (
        item.rarity &&
        ['rare', 'epic', 'legendary', 'unique'].includes(
          item.rarity.toLowerCase(),
        )
      ) {
        return true;
      }

      // Check for high value
      if (item.value && item.value > 1000) {
        return true;
      }

      // Check for special effects
      if (item.effects && Object.keys(item.effects).length > 0) {
        return true;
      }

      return false;
    });

    // Limit to maximum 3 items
    const selectedItems = significantItems.slice(0, 3);

    // Format as legacy items
    return selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      rarity: item.rarity || 'common',
      type: item.type || 'item',
    }));
  }

  private async extractCharacterKnowledge(
    character: Character,
  ): Promise<LegacyKnowledge[]> {
    // Get important memories using the available findRelevantMemories method
    const memories = await this.memoryService.findRelevantMemories(
      'Important memories', // Context (not used for filtering but required by method)
      character.id,
      10, // Limit to 10 memories
    );

    // Convert to legacy knowledge
    return memories.map((memory) => ({
      title: memory.title,
      content: memory.content,
      importance: memory.importance,
    }));
  }

  private async generateLegacyDescription(
    character: Character,
    deathDescription?: string,
  ): Promise<string> {
    // Get key memories using the available findRelevantMemories method
    const memories = await this.memoryService.findRelevantMemories(
      'Legacy memories', // Context (not used for filtering but required by method)
      character.id,
      5, // Limit to 5 memories
    );
    const memoryText = memories
      .map((m) => `- ${m.title}: ${m.content}`)
      .join('\n');

    const prompt = `
      Create a detailed legacy description for a character who has died. This legacy will be passed 
      down to a future character. Include details about their achievements, notable deeds, and how 
      they will be remembered.
      
      Character: ${character.name}
      Class: ${character.characterClass}
      Level: ${character.level}
      ${deathDescription ? `Death: ${deathDescription}` : ''}
      
      Key memories and achievements:
      ${memoryText}
      
      Legacy description (200-300 words):
    `;

    const result = await this.geminiAiService.generateContent(prompt);
    return result.trim();
  }

  private calculateLegacyBonuses(
    character: Character,
    death?: CharacterDeath,
  ): Record<string, number> {
    const bonuses: Record<string, number> = {};

    // Base bonus based on level
    bonuses.startingExperience = character.level * 100;

    // Bonus based on survival time
    if (death?.stats?.daysSurvived) {
      bonuses.survivalBonus = Math.min(death.stats.daysSurvived * 5, 500);
    }

    // Bonus based on quests completed
    if (death?.stats?.questsCompleted) {
      bonuses.questExperience = death.stats.questsCompleted * 50;
    }

    // Small attribute bonuses based on character class
    switch (character.characterClass.toLowerCase()) {
      case 'warrior':
      case 'fighter':
      case 'knight':
        bonuses.strengthBonus = Math.min(character.level / 5, 3);
        break;
      case 'mage':
      case 'wizard':
      case 'sorcerer':
        bonuses.intelligenceBonus = Math.min(character.level / 5, 3);
        break;
      case 'rogue':
      case 'thief':
      case 'assassin':
        bonuses.dexterityBonus = Math.min(character.level / 5, 3);
        break;
    }

    return bonuses;
  }

  private applyLegacyItems(
    character: Character,
    legacyItems: LegacyItem[],
  ): void {
    if (!character.inventory) {
      character.inventory = { items: [], currency: {} };
    }

    if (!character.inventory.items) {
      character.inventory.items = [];
    }

    // Add legacy items to inventory with a special mark
    for (const legacyItem of legacyItems) {
      character.inventory.items.push({
        id: legacyItem.id,
        name: `${legacyItem.name} (Legacy)`,
        description: `${legacyItem.description}\n\nThis item was passed down as a legacy.`,
        quantity: 1,
        type: legacyItem.type,
        rarity: legacyItem.rarity,
        effects: { isLegacy: true },
      });
    }
  }

  private async applyLegacyKnowledge(
    characterId: string,
    knowledge: LegacyKnowledge[],
  ): Promise<void> {
    // Add each piece of knowledge as a memory
    for (const item of knowledge) {
      await this.memoryService.createMemory({
        characterId,
        title: `Inherited Knowledge: ${item.title}`,
        content: item.content,
        type: MemoryType.LEGACY,
        importance: item.importance * 0.8, // Slightly reduced importance for inherited memories
      });
    }
  }

  private applyLegacyBonuses(
    character: Character,
    bonuses: Record<string, number>,
  ): void {
    // Apply experience bonus
    if (bonuses.startingExperience) {
      character.experience += bonuses.startingExperience;
    }

    if (bonuses.questExperience) {
      character.experience += bonuses.questExperience;
    }

    // Apply attribute bonuses
    if (!character.attributes) {
      character.attributes = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        health: 100,
        mana: 100,
      };
    }

    if (bonuses.strengthBonus) {
      character.attributes.strength += bonuses.strengthBonus;
    }

    if (bonuses.intelligenceBonus) {
      character.attributes.intelligence += bonuses.intelligenceBonus;
    }

    if (bonuses.dexterityBonus) {
      character.attributes.dexterity += bonuses.dexterityBonus;
    }
  }

  async getAvailableLegacies(userId: string): Promise<Legacy[]> {
    // Find all legacies from user's dead characters that haven't been inherited
    const deadCharacters = await this.characterRepository.find({
      where: { user: { id: userId }, isDead: true },
    });

    const characterIds = deadCharacters.map((char) => char.id);

    // If there are no character IDs, return an empty array
    if (characterIds.length === 0) {
      return [];
    }

    // Use TypeORM's In operator instead of MongoDB-style $in
    return this.legacyRepository
      .createQueryBuilder('legacy')
      .where('legacy.originCharacterId IN (:...characterIds)', { characterIds })
      .andWhere('legacy.isInherited = :isInherited', { isInherited: false })
      .getMany();
  }
}
