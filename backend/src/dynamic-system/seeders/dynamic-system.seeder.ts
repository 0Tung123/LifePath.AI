import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { DynamicType } from '../entities/dynamic-type.entity';
import { ValidationRule } from '../entities/validation-rule.entity';
import {
  TagCategory,
  TagRarity,
  DynamicTypeCategory,
} from '../../common/types/dynamic-system.types';

@Injectable()
export class DynamicSystemSeeder {
  private readonly logger = new Logger(DynamicSystemSeeder.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(DynamicType)
    private dynamicTypeRepository: Repository<DynamicType>,
    @InjectRepository(ValidationRule)
    private validationRuleRepository: Repository<ValidationRule>,
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log('Starting Dynamic System seeding...');

    await this.seedBasicTags();
    await this.seedValidationRules();
    await this.seedExampleDynamicTypes();

    this.logger.log('Dynamic System seeding completed!');
  }

  private async seedBasicTags(): Promise<void> {
    this.logger.log('Seeding basic tags...');

    const basicTags = [
      // Elements
      {
        name: 'Fire',
        category: TagCategory.ELEMENT,
        description:
          'Grants fire-based abilities and resistance to fire damage',
        properties: { fire_damage: 25, fire_resistance: 30 },
        rarity: TagRarity.COMMON,
        conflicts: ['Water', 'Ice'],
      },
      {
        name: 'Water',
        category: TagCategory.ELEMENT,
        description: 'Grants water-based abilities and healing properties',
        properties: { water_damage: 20, healing_bonus: 15 },
        rarity: TagRarity.COMMON,
        conflicts: ['Fire', 'Lightning'],
      },
      {
        name: 'Earth',
        category: TagCategory.ELEMENT,
        description: 'Provides defensive bonuses and earth manipulation',
        properties: { defense: 30, earth_damage: 20 },
        rarity: TagRarity.COMMON,
        conflicts: ['Air', 'Wind'],
      },
      {
        name: 'Air',
        category: TagCategory.ELEMENT,
        description: 'Grants speed and wind-based attacks',
        properties: { speed: 25, wind_damage: 22 },
        rarity: TagRarity.COMMON,
        conflicts: ['Earth'],
      },
      {
        name: 'Lightning',
        category: TagCategory.ELEMENT,
        description: 'Powerful electrical attacks with stunning effects',
        properties: { lightning_damage: 35, stun_chance: 0.2 },
        rarity: TagRarity.UNCOMMON,
        conflicts: ['Water'],
      },
      {
        name: 'Ice',
        category: TagCategory.ELEMENT,
        description: 'Freezing attacks that slow enemies',
        properties: { ice_damage: 28, slow_chance: 0.3 },
        rarity: TagRarity.UNCOMMON,
        conflicts: ['Fire'],
      },

      // Weapon Types
      {
        name: 'Sword',
        category: TagCategory.ITEM_TYPE,
        description: 'Balanced melee weapon with good damage and speed',
        properties: { damage: 50, speed: 70, reach: 60 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Bow',
        category: TagCategory.ITEM_TYPE,
        description: 'Ranged weapon for precise attacks',
        properties: { damage: 45, speed: 60, range: 90 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Staff',
        category: TagCategory.ITEM_TYPE,
        description: 'Magical weapon that amplifies spells',
        properties: { magic_damage: 60, mana_efficiency: 0.2 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Dagger',
        category: TagCategory.ITEM_TYPE,
        description: 'Fast, light weapon with critical hit potential',
        properties: { damage: 35, speed: 90, crit_chance: 0.15 },
        rarity: TagRarity.COMMON,
      },

      // Materials
      {
        name: 'Steel',
        category: TagCategory.MATERIAL,
        description: 'Strong, reliable metal for weapons and armor',
        properties: { durability: 80, damage_bonus: 10 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Mithril',
        category: TagCategory.MATERIAL,
        description: 'Legendary lightweight metal with magical properties',
        properties: {
          durability: 120,
          weight_reduction: 0.5,
          magic_resistance: 20,
        },
        rarity: TagRarity.LEGENDARY,
      },
      {
        name: 'Dragon Scale',
        category: TagCategory.MATERIAL,
        description: 'Scales from ancient dragons, extremely durable',
        properties: { durability: 150, fire_resistance: 80, intimidation: 30 },
        rarity: TagRarity.MYTHICAL,
      },

      // Character Classes
      {
        name: 'Warrior',
        category: TagCategory.CLASS,
        description: 'Master of melee combat and physical prowess',
        properties: { strength: 30, constitution: 25, weapon_mastery: 20 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Mage',
        category: TagCategory.CLASS,
        description: 'Wielder of arcane magic and ancient knowledge',
        properties: { intelligence: 35, mana: 50, spell_power: 25 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Rogue',
        category: TagCategory.CLASS,
        description: 'Master of stealth, speed, and precision',
        properties: { dexterity: 35, stealth: 40, crit_chance: 0.1 },
        rarity: TagRarity.COMMON,
      },
      {
        name: 'Paladin',
        category: TagCategory.CLASS,
        description: 'Holy warrior combining combat and divine magic',
        properties: { strength: 25, wisdom: 20, holy_damage: 20, healing: 15 },
        rarity: TagRarity.UNCOMMON,
      },

      // Enchantments
      {
        name: 'Sharpness',
        category: TagCategory.ENCHANTMENT,
        description: 'Increases weapon damage significantly',
        properties: { damage_multiplier: 1.3 },
        rarity: TagRarity.UNCOMMON,
      },
      {
        name: 'Vampiric',
        category: TagCategory.ENCHANTMENT,
        description: 'Heals the wielder based on damage dealt',
        properties: { life_steal: 0.15 },
        rarity: TagRarity.RARE,
      },
      {
        name: 'Phoenix',
        category: TagCategory.ENCHANTMENT,
        description: 'Grants resurrection ability and fire immunity',
        properties: { fire_immunity: 1, resurrection: 1 },
        rarity: TagRarity.DIVINE,
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
        ],
      },
    ];

    for (const tagData of basicTags) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: tagData.name },
      });

      if (!existingTag) {
        const tag = this.tagRepository.create({
          name: tagData.name,
          category: tagData.category,
          description: tagData.description,
          properties: tagData.properties,
          rarity: tagData.rarity,
          conflicts: tagData.conflicts,
          synergies: tagData.synergies,
          createdBy: { type: 'system' as const },
          isActive: true,
        });

        await this.tagRepository.save(tag);
        this.logger.log(`Created tag: ${tagData.name}`);
      }
    }
  }

  private async seedValidationRules(): Promise<void> {
    this.logger.log('Seeding validation rules...');

    const validationRules = [
      {
        name: 'Fire-Water Conflict',
        description: 'Fire and Water elements cannot be combined',
        category: DynamicTypeCategory.EQUIPMENT,
        conditions: [
          {
            type: 'tag_forbidden' as const,
            parameters: { tagName: 'Water' },
            errorMessage: 'Fire and Water elements are incompatible',
          },
        ],
        severity: 'error' as const,
      },
      {
        name: 'Maximum Element Limit',
        description: 'Equipment can have at most 2 elemental tags',
        category: DynamicTypeCategory.EQUIPMENT,
        conditions: [
          {
            type: 'tag_limit' as const,
            parameters: { maxCount: 2, category: 'element' },
            errorMessage: 'Too many elemental tags (maximum 2)',
          },
        ],
        severity: 'warning' as const,
      },
      {
        name: 'Divine Rarity Requirement',
        description: 'Divine enchantments require legendary base items',
        category: DynamicTypeCategory.EQUIPMENT,
        conditions: [
          {
            type: 'tag_required' as const,
            parameters: { tagName: 'Legendary' },
            errorMessage: 'Divine enchantments require legendary base items',
          },
        ],
        severity: 'error' as const,
      },
    ];

    for (const ruleData of validationRules) {
      const existingRule = await this.validationRuleRepository.findOne({
        where: { name: ruleData.name },
      });

      if (!existingRule) {
        const rule = this.validationRuleRepository.create({
          name: ruleData.name,
          description: ruleData.description,
          category: ruleData.category,
          conditions: ruleData.conditions,
          severity: ruleData.severity,
          isActive: true,
        });

        await this.validationRuleRepository.save(rule);
        this.logger.log(`Created validation rule: ${ruleData.name}`);
      }
    }
  }

  private async seedExampleDynamicTypes(): Promise<void> {
    this.logger.log('Seeding example dynamic types...');

    const exampleTypes = [
      {
        name: 'Flaming Sword of the Phoenix',
        description:
          'A legendary blade forged in dragon fire and blessed by the Phoenix. Its blade burns with eternal flames that never consume the wielder.',
        category: DynamicTypeCategory.EQUIPMENT,
        tags: ['Fire', 'Sword', 'Phoenix', 'Legendary'],
        baseProperties: {
          damage: 120,
          durability: 800,
          weight: 3.5,
          fire_damage: 50,
          fire_resistance: 90,
        },
        rarity: TagRarity.LEGENDARY,
        powerLevel: 85,
      },
      {
        name: 'Frost Archer of the Northern Winds',
        description:
          'A master archer from the frozen northlands, wielding ice magic and unparalleled precision with the bow.',
        category: DynamicTypeCategory.NPC,
        tags: ['Ice', 'Bow', 'Archer', 'Northern'],
        baseProperties: {
          level: 45,
          health: 850,
          mana: 400,
          accuracy: 95,
          ice_mastery: 80,
        },
        rarity: TagRarity.RARE,
        powerLevel: 70,
      },
      {
        name: 'Lightning Strike',
        description:
          'Channel the power of storms to strike enemies with devastating electrical energy.',
        category: DynamicTypeCategory.SKILL,
        tags: ['Lightning', 'Offensive', 'Instant'],
        baseProperties: {
          damage: 200,
          mana_cost: 50,
          cast_time: 1.5,
          stun_duration: 2,
          chain_targets: 3,
        },
        rarity: TagRarity.UNCOMMON,
        powerLevel: 60,
      },
    ];

    for (const typeData of exampleTypes) {
      const existingType = await this.dynamicTypeRepository.findOne({
        where: { name: typeData.name },
      });

      if (!existingType) {
        const dynamicType = this.dynamicTypeRepository.create({
          name: typeData.name,
          description: typeData.description,
          category: typeData.category,
          tags: typeData.tags,
          baseProperties: typeData.baseProperties,
          rarity: typeData.rarity,
          powerLevel: typeData.powerLevel,
          createdBy: { type: 'system' as const },
          isTemplate: true,
          isActive: true,
        });

        await this.dynamicTypeRepository.save(dynamicType);
        this.logger.log(`Created dynamic type: ${typeData.name}`);
      }
    }
  }
}
