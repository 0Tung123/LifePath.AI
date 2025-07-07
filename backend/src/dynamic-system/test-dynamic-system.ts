#!/usr/bin/env node

/**
 * Test script for Dynamic System
 * Run with: npx ts-node src/dynamic-system/test-dynamic-system.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DynamicSystemService } from './services/dynamic-system.service';
import { DynamicSystemSeeder } from './seeders/dynamic-system.seeder';
import {
  TagCategory,
  TagRarity,
  DynamicTypeCategory,
} from '../common/types/dynamic-system.types';

async function testDynamicSystem() {
  console.log('🚀 Starting Dynamic System Test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const dynamicSystemService = app.get(DynamicSystemService);
  // const aiGenerationService = app.get(AIGenerationService);
  const seeder = app.get(DynamicSystemSeeder);

  try {
    // 1. Seed basic data
    console.log('📦 Step 1: Seeding basic data...');
    await seeder.seedAll();
    console.log('✅ Seeding completed\n');

    // 2. Test tag creation
    console.log('🏷️  Step 2: Testing tag creation...');
    const newTag = await dynamicSystemService.createTag({
      name: 'Shadow',
      category: TagCategory.ELEMENT,
      description: 'Dark elemental magic that manipulates shadows',
      properties: { shadow_damage: 30, stealth_bonus: 20 },
      rarity: TagRarity.RARE,
      createdBy: { type: 'admin', id: 'test-user' },
    });
    console.log(`✅ Created tag: ${newTag.name} (ID: ${newTag.id})\n`);

    // 3. Test tag combination validation
    console.log('🔍 Step 3: Testing tag combination validation...');
    const combinationResult = await dynamicSystemService.combineTagsPreview({
      tagNames: ['Fire', 'Sword', 'Sharpness'],
      category: DynamicTypeCategory.EQUIPMENT,
    });
    console.log('Combination result:', {
      isValid: combinationResult.isValid,
      conflicts: combinationResult.conflicts,
      synergies: combinationResult.synergies.length,
      powerLevel: combinationResult.powerLevel,
      rarity: combinationResult.rarity,
    });
    console.log('✅ Tag combination validation completed\n');

    // 4. Test dynamic type creation
    console.log('⚔️  Step 4: Testing dynamic type creation...');
    const newDynamicType = await dynamicSystemService.createDynamicType({
      name: 'Shadow Blade of Whispers',
      description:
        'A mysterious blade that seems to absorb light and sound around it',
      category: DynamicTypeCategory.EQUIPMENT,
      tags: ['Shadow', 'Sword', 'Stealth'],
      baseProperties: {
        damage: 85,
        durability: 600,
        stealth_bonus: 40,
        shadow_damage: 25,
      },
      rarity: TagRarity.EPIC,
      powerLevel: 75,
      createdBy: { type: 'admin', id: 'test-user' },
    });
    console.log(
      `✅ Created dynamic type: ${newDynamicType.name} (ID: ${newDynamicType.id})\n`,
    );

    // 5. Test AI generation (if available)
    console.log('🤖 Step 5: Testing AI generation...');
    try {
      const aiGeneratedTypes = await dynamicSystemService.generateDynamicType({
        category: DynamicTypeCategory.SKILL,
        gameId: 'test-game-123',
        storyContext:
          'The player is exploring a mystical forest filled with ancient magic',
        requiredTags: ['Nature', 'Magic'],
        powerLevelRange: [40, 70],
        allowedRarities: [TagRarity.UNCOMMON, TagRarity.RARE],
        count: 2,
        customPrompt:
          'Create nature-based magical skills for forest exploration',
      });

      console.log(`✅ Generated ${aiGeneratedTypes.length} AI types:`);
      aiGeneratedTypes.forEach((type, index) => {
        console.log(
          `  ${index + 1}. ${type.name} (${type.rarity}, Power: ${type.powerLevel})`,
        );
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(
        `⚠️  AI generation failed (expected if no API key): ${errorMessage}`,
      );
    }
    console.log();

    // 6. Test queries
    console.log('📊 Step 6: Testing queries...');

    const allTags = await dynamicSystemService.findAllTags();
    console.log(`✅ Found ${allTags.length} tags`);

    const fireTags = await dynamicSystemService.findAllTags(
      TagCategory.ELEMENT,
    );
    console.log(`✅ Found ${fireTags.length} elemental tags`);

    const allDynamicTypes = await dynamicSystemService.findAllDynamicTypes();
    console.log(`✅ Found ${allDynamicTypes.length} dynamic types`);

    const equipmentTypes = await dynamicSystemService.findAllDynamicTypes(
      DynamicTypeCategory.EQUIPMENT,
    );
    console.log(`✅ Found ${equipmentTypes.length} equipment types\n`);

    // 7. Test search functionality
    console.log('🔎 Step 7: Testing search functionality...');
    const searchResults = await dynamicSystemService.findAllTags(
      undefined,
      undefined,
      undefined,
      'fire',
    );
    console.log(`✅ Found ${searchResults.length} tags matching 'fire'\n`);

    // 8. Display summary
    console.log('📈 Summary:');
    console.log(`- Total Tags: ${allTags.length}`);
    console.log(`- Total Dynamic Types: ${allDynamicTypes.length}`);
    console.log(`- Equipment Types: ${equipmentTypes.length}`);
    console.log(`- Elemental Tags: ${fireTags.length}`);

    console.log('\n🎉 All tests completed successfully!');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack =
      error instanceof Error ? error.stack : 'No stack trace available';
    console.error('❌ Test failed:', errorMessage);
    console.error(errorStack);
  } finally {
    await app.close();
  }
}

// Run the test
if (require.main === module) {
  testDynamicSystem().catch(console.error);
}

export { testDynamicSystem };
