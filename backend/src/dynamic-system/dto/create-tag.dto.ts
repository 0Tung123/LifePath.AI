import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TagCategory,
  TagRarity,
  TagCreator,
  TagSynergy,
  TagProperties,
  SynergyEffects,
  ValidationParameters,
} from '../../common/types/dynamic-system.types';

export class TagCreatorDto implements TagCreator {
  @ApiProperty({
    example: 'admin',
    description: 'Creator type',
    enum: ['ai', 'admin', 'system'],
  })
  @IsEnum(['ai', 'admin', 'system'])
  type!: 'ai' | 'admin' | 'system';

  @ApiProperty({
    example: 'user-uuid',
    description: 'User ID if admin created',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    example: 'gemini-2.0-flash',
    description: 'AI model if AI created',
    required: false,
  })
  @IsOptional()
  @IsString()
  aiModel?: string;

  @ApiProperty({
    example: 'Generated during fire dungeon exploration',
    description: 'Creation context',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string | undefined;
}

export class SynergyEffectDto {
  @ApiProperty({
    example: 'stat_bonus',
    description: 'Effect type',
    enum: ['stat_bonus', 'new_ability', 'transformation', 'special_event'],
  })
  @IsEnum(['stat_bonus', 'new_ability', 'transformation', 'special_event'])
  type!: 'stat_bonus' | 'new_ability' | 'transformation' | 'special_event';

  @ApiProperty({ example: 'Inferno Mastery', description: 'Effect name' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Combines fire and magic for devastating attacks',
    description: 'Effect description',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    example: { damage_multiplier: 2.5, mana_cost_reduction: 0.3 },
    description: 'Effect properties',
  })
  @IsObject()
  effects!: SynergyEffects;

  @ApiProperty({
    example: -1,
    description: 'Effect duration in seconds (-1 = permanent)',
    required: false,
  })
  @IsOptional()
  duration?: number;
}

export class TagSynergyDto implements TagSynergy {
  @ApiProperty({
    example: ['fire', 'magic'],
    description: 'Required tag names for synergy',
  })
  @IsArray()
  @IsString({ each: true })
  requiredTags!: string[];

  @ApiProperty({ description: 'Synergy effect' })
  @ValidateNested()
  @Type(() => SynergyEffectDto)
  effect!: SynergyEffectDto;

  @ApiProperty({
    example: 0.8,
    description: 'Activation probability (0-1)',
    required: false,
  })
  @IsOptional()
  probability?: number;

  @ApiProperty({
    example: { min_level: 10, location: 'fire_temple' },
    description: 'Special conditions',
    required: false,
  })
  @IsOptional()
  @IsObject()
  conditions?: ValidationParameters;
}

export class CreateTagDto {
  @ApiProperty({
    example: 'Fire Elemental',
    description: 'Tag name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({
    example: TagCategory.ELEMENT,
    description: 'Tag category',
    enum: TagCategory,
  })
  @IsEnum(TagCategory)
  category!: TagCategory;

  @ApiProperty({
    example: 'Grants fire-based abilities and resistance',
    description: 'Tag description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({
    example: { damage_bonus: 25, fire_resistance: 50 },
    description: 'Tag properties',
    required: false,
  })
  @IsOptional()
  @IsObject()
  properties?: TagProperties;

  @ApiProperty({
    example: TagRarity.RARE,
    description: 'Tag rarity',
    enum: TagRarity,
    required: false,
    default: TagRarity.COMMON,
  })
  @IsOptional()
  @IsEnum(TagRarity)
  rarity?: TagRarity;

  @ApiProperty({
    example: ['water', 'ice'],
    description: 'Conflicting tag names',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflicts?: string[];

  @ApiProperty({
    description: 'Tag synergies',
    required: false,
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagSynergyDto)
  synergies?: TagSynergyDto[];

  @ApiProperty({
    example: { type: 'admin', id: 'user-uuid' },
    description: 'Tag creator info',
  })
  @ValidateNested()
  @Type(() => TagCreatorDto)
  createdBy!: TagCreatorDto;

  @ApiProperty({
    example: true,
    description: 'Is tag active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTagDto {
  @ApiProperty({
    example: 'Fire Elemental Master',
    description: 'Updated tag name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiProperty({
    example: 'Enhanced fire-based abilities and immunity',
    description: 'Updated description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({
    example: { damage_bonus: 35, fire_resistance: 75 },
    description: 'Updated properties',
    required: false,
  })
  @IsOptional()
  @IsObject()
  properties?: TagProperties;

  @ApiProperty({
    example: TagRarity.EPIC,
    description: 'Updated rarity',
    required: false,
  })
  @IsOptional()
  @IsEnum(TagRarity)
  rarity?: TagRarity;

  @ApiProperty({
    example: false,
    description: 'Updated active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
