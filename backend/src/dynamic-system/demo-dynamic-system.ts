#!/usr/bin/env node

/**
 * Demo script for Dynamic System (without database)
 * Shows the core concepts and functionality
 */

import {
  TagCategory,
  TagRarity,
  DynamicTypeCategory,
  TagSynergy,
  TagCombinationResult,
} from '../common/types/dynamic-system.types';

// Mock data for demonstration
const mockTags = [
  {
    id: '1',
    name: 'Fire',
    category: TagCategory.ELEMENT,
    description: 'Grants fire-based abilities and resistance',
    properties: { fire_damage: 25, fire_resistance: 30 } as Record<string, any>,
    rarity: TagRarity.COMMON,
    conflicts: ['Water', 'Ice'] as string[],
    synergies: [] as TagSynergy[],
    createdBy: { type: 'system' as const },
    isActive: true,
    usageCount: 150,
  },
  {
    id: '2',
    name: 'Sword',
    category: TagCategory.ITEM_TYPE,
    description: 'Balanced melee weapon',
    properties: { damage: 50, speed: 70, reach: 60 } as Record<string, any>,
    rarity: TagRarity.COMMON,
    conflicts: [] as string[],
    synergies: [] as TagSynergy[],
    createdBy: { type: 'system' as const },
    isActive: true,
    usageCount: 200,
  },
  {
    id: '3',
    name: 'Phoenix',
    category: TagCategory.ENCHANTMENT,
    description: 'Legendary phoenix blessing',
    properties: { fire_immunity: 1, resurrection: 1 } as Record<string, any>,
    rarity: TagRarity.DIVINE,
    conflicts: [] as string[],
    synergies: [
      {
        requiredTags: ['Fire', 'Legendary'],
        effect: {
          type: 'new_ability' as const,
          name: 'Phoenix Rebirth',
          description: 'Resurrect with full health when killed',
          effects: { auto_resurrect: 1 },
        },
      },
    ] as TagSynergy[],
    createdBy: { type: 'system' as const },
    isActive: true,
    usageCount: 25,
  },
  {
    id: '4',
    name: 'Legendary',
    category: TagCategory.RARITY,
    description: 'Marks items of legendary quality',
    properties: { power_multiplier: 2.0, durability_bonus: 100 } as Record<
      string,
      any
    >,
    rarity: TagRarity.LEGENDARY,
    conflicts: [] as string[],
    synergies: [] as TagSynergy[],
    createdBy: { type: 'system' as const },
    isActive: true,
    usageCount: 75,
  },
];

class DynamicSystemDemo {
  private tags = mockTags;

  // Simulate tag combination validation
  validateTagCombination(
    tagNames: string[],
    category: DynamicTypeCategory,
  ): TagCombinationResult {
    console.log(
      `\n🔍 Validating combination: [${tagNames.join(', ')}] for ${category}`,
    );

    const selectedTags = this.tags.filter((tag) => tagNames.includes(tag.name));
    const conflicts: string[] = [];
    const synergies: TagSynergy[] = [];

    // Check conflicts
    for (const tag of selectedTags) {
      if (tag.conflicts) {
        const conflictingTags = tagNames.filter((name: string) =>
          tag.conflicts.includes(name),
        );
        if (conflictingTags.length > 0) {
          conflicts.push(
            `${tag.name} conflicts with: ${conflictingTags.join(', ')}`,
          );
        }
      }
    }

    // Find synergies
    for (const tag of selectedTags) {
      if (tag.synergies) {
        for (const synergy of tag.synergies) {
          const hasAllRequiredTags = synergy.requiredTags.every((reqTag) =>
            tagNames.includes(reqTag),
          );

          if (hasAllRequiredTags) {
            synergies.push(synergy);
          }
        }
      }
    }

    // Calculate power level
    const powerLevel = this.calculatePowerLevel(selectedTags, synergies);
    const rarity = this.calculateRarity(selectedTags, synergies);

    const result: TagCombinationResult = {
      isValid: conflicts.length === 0,
      conflicts,
      synergies,
      suggestedProperties: this.computeProperties(selectedTags, synergies),
      powerLevel,
      rarity,
      warnings: [],
    };

    return result;
  }

  private calculatePowerLevel(tags: any[], synergies: TagSynergy[]): number {
    const basePower = tags.reduce((sum, tag) => {
      const rarityMultiplier = this.getRarityMultiplier(tag.rarity);
      return sum + 10 * rarityMultiplier;
    }, 0);

    const synergyBonus = synergies.length * 15;
    return Math.min(100, Math.max(1, basePower + synergyBonus));
  }

  private calculateRarity(tags: any[], synergies: TagSynergy[]): TagRarity {
    const rarityValues = {
      [TagRarity.COMMON]: 1,
      [TagRarity.UNCOMMON]: 2,
      [TagRarity.RARE]: 3,
      [TagRarity.EPIC]: 4,
      [TagRarity.LEGENDARY]: 5,
      [TagRarity.MYTHICAL]: 6,
      [TagRarity.DIVINE]: 7,
      [TagRarity.UNIQUE]: 8,
    };

    const maxTagRarity = Math.max(
      ...tags.map((tag) => rarityValues[tag.rarity]),
    );
    const synergyBonus = synergies.length > 0 ? 1 : 0;
    const finalRarity = Math.min(8, maxTagRarity + synergyBonus);

    return Object.keys(rarityValues).find(
      (key) => rarityValues[key as TagRarity] === finalRarity,
    ) as TagRarity;
  }

  private getRarityMultiplier(rarity: TagRarity): number {
    const multipliers = {
      [TagRarity.COMMON]: 1,
      [TagRarity.UNCOMMON]: 1.2,
      [TagRarity.RARE]: 1.5,
      [TagRarity.EPIC]: 2,
      [TagRarity.LEGENDARY]: 3,
      [TagRarity.MYTHICAL]: 4,
      [TagRarity.DIVINE]: 5,
      [TagRarity.UNIQUE]: 6,
    };
    return multipliers[rarity] || 1;
  }

  private computeProperties(
    tags: any[],
    synergies: TagSynergy[],
  ): Record<string, any> {
    const computed: Record<string, any> = {};

    // Apply tag properties
    for (const tag of tags) {
      if (tag.properties) {
        for (const [key, value] of Object.entries(tag.properties)) {
          if (typeof value === 'number' && typeof computed[key] === 'number') {
            computed[key] = (computed[key] || 0) + value;
          } else if (computed[key] === undefined) {
            computed[key] = value;
          }
        }
      }
    }

    // Apply synergy effects
    for (const synergy of synergies) {
      if (synergy.effect.effects) {
        for (const [key, value] of Object.entries(synergy.effect.effects)) {
          if (typeof value === 'number' && typeof computed[key] === 'number') {
            computed[key] = (computed[key] || 0) * (1 + value);
          } else if (computed[key] === undefined) {
            computed[key] = value;
          }
        }
      }
    }

    return computed;
  }

  // Demo different scenarios
  runDemo() {
    console.log('🎮 Dynamic System Demo - Tag-based Content Generation');
    console.log('='.repeat(60));

    // Scenario 1: Valid combination
    console.log('\n📋 Scenario 1: Creating a Fire Sword');
    const result1 = this.validateTagCombination(
      ['Fire', 'Sword'],
      DynamicTypeCategory.EQUIPMENT,
    );
    this.printResult(result1);

    // Scenario 2: Legendary combination with synergy
    console.log('\n📋 Scenario 2: Creating a Legendary Phoenix Fire Sword');
    const result2 = this.validateTagCombination(
      ['Fire', 'Sword', 'Phoenix', 'Legendary'],
      DynamicTypeCategory.EQUIPMENT,
    );
    this.printResult(result2);

    // Scenario 3: Conflicting combination
    console.log(
      '\n📋 Scenario 3: Trying to combine Fire and Water (should conflict)',
    );
    // Add water tag for demo
    this.tags.push({
      id: '5',
      name: 'Water',
      category: TagCategory.ELEMENT,
      description: 'Water-based abilities',
      properties: { water_damage: 20, healing_bonus: 15 } as Record<
        string,
        any
      >,
      rarity: TagRarity.COMMON,
      conflicts: ['Fire'] as string[],
      synergies: [] as TagSynergy[],
      createdBy: { type: 'system' as const },
      isActive: true,
      usageCount: 120,
    });

    const result3 = this.validateTagCombination(
      ['Fire', 'Water', 'Sword'],
      DynamicTypeCategory.EQUIPMENT,
    );
    this.printResult(result3);

    // Show AI generation concept
    console.log('\n🤖 AI Generation Concept:');
    console.log('='.repeat(40));
    this.demoAIGeneration();

    console.log(
      '\n✨ Demo completed! This shows how the Dynamic System works:',
    );
    console.log('- Tags are building blocks for dynamic content');
    console.log('- Validation prevents impossible combinations');
    console.log('- Synergies create emergent gameplay');
    console.log('- AI can generate unlimited content using these rules');
  }

  private printResult(result: TagCombinationResult) {
    console.log(`   ✅ Valid: ${result.isValid}`);
    console.log(`   🎯 Power Level: ${result.powerLevel}`);
    console.log(`   💎 Rarity: ${result.rarity}`);

    if (result.conflicts.length > 0) {
      console.log(`   ⚠️  Conflicts: ${result.conflicts.join(', ')}`);
    }

    if (result.synergies.length > 0) {
      console.log(`   ⚡ Synergies: ${result.synergies.length} active`);
      result.synergies.forEach((synergy) => {
        console.log(
          `      - ${synergy.effect.name}: ${synergy.effect.description}`,
        );
      });
    }

    console.log(`   📊 Properties:`, result.suggestedProperties);
  }

  private demoAIGeneration() {
    console.log('When player enters a "Fire Temple", AI might generate:');
    console.log('');

    const scenarios = [
      {
        context: 'Fire Temple Guardian',
        tags: ['Fire', 'Guardian', 'Ancient'],
        type: 'NPC',
        description: 'An ancient flame spirit guarding sacred artifacts',
      },
      {
        context: 'Volcanic Treasure',
        tags: ['Fire', 'Legendary', 'Weapon'],
        type: 'Equipment',
        description: 'A weapon forged in volcanic fires',
      },
      {
        context: 'Fire Magic Skill',
        tags: ['Fire', 'Magic', 'Offensive'],
        type: 'Skill',
        description: 'A powerful fire spell learned from ancient texts',
      },
    ];

    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.context} (${scenario.type})`);
      console.log(`   Tags: [${scenario.tags.join(', ')}]`);
      console.log(`   ${scenario.description}`);

      const result = this.validateTagCombination(
        scenario.tags,
        scenario.type as DynamicTypeCategory,
      );
      console.log(`   Power: ${result.powerLevel}, Rarity: ${result.rarity}`);
      console.log('');
    });
  }
}

// Run the demo
if (require.main === module) {
  const demo = new DynamicSystemDemo();
  demo.runDemo();
}

export { DynamicSystemDemo };
