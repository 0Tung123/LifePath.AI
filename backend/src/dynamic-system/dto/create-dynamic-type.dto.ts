import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
  Length,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DynamicTypeCategory,
  TagRarity,
} from '../../common/types/dynamic-system.types';
import { TagCreatorDto } from './create-tag.dto';

export class CreateDynamicTypeDto {
  @ApiProperty({
    example: 'Flame Sword of the Phoenix',
    description: 'Dynamic type name',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({
    example:
      'A legendary sword imbued with phoenix fire, forged in the heart of a volcano...',
    description: 'Dynamic type description',
  })
  @IsString()
  @Length(10, 2000)
  description!: string;

  @ApiProperty({
    example: DynamicTypeCategory.EQUIPMENT,
    description: 'Dynamic type category',
    enum: DynamicTypeCategory,
  })
  @IsEnum(DynamicTypeCategory)
  category!: DynamicTypeCategory;

  @ApiProperty({
    example: ['fire', 'weapon', 'legendary', 'phoenix'],
    description: 'Tag names to associate',
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({
    example: {
      damage: 100,
      durability: 500,
      weight: 3.5,
      material: 'phoenix_steel',
    },
    description: 'Base properties',
  })
  @IsObject()
  baseProperties!: Record<string, any>;

  @ApiProperty({
    example: TagRarity.LEGENDARY,
    description: 'Dynamic type rarity',
    enum: TagRarity,
  })
  @IsEnum(TagRarity)
  rarity!: TagRarity;

  @ApiProperty({
    example: 85,
    description: 'Power level (1-100)',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  powerLevel!: number;

  @ApiProperty({
    example: { type: 'admin', id: 'user-uuid' },
    description: 'Creator info',
  })
  @ValidateNested()
  @Type(() => TagCreatorDto)
  createdBy!: TagCreatorDto;

  @ApiProperty({
    example: false,
    description: 'Is this a reusable template',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({
    example: true,
    description: 'Is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDynamicTypeDto {
  @ApiProperty({
    example: 'Flame Sword of the Phoenix Lord',
    description: 'Updated name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  name?: string;

  @ApiProperty({
    example: 'An evolved legendary sword...',
    description: 'Updated description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(10, 2000)
  description?: string;

  @ApiProperty({
    example: ['fire', 'weapon', 'legendary', 'phoenix', 'divine'],
    description: 'Updated tag names',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: { damage: 150, durability: 750 },
    description: 'Updated base properties',
    required: false,
  })
  @IsOptional()
  @IsObject()
  baseProperties?: Record<string, any>;

  @ApiProperty({
    example: TagRarity.MYTHICAL,
    description: 'Updated rarity',
    required: false,
  })
  @IsOptional()
  @IsEnum(TagRarity)
  rarity?: TagRarity;

  @ApiProperty({
    example: 95,
    description: 'Updated power level',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  powerLevel?: number;

  @ApiProperty({
    example: true,
    description: 'Updated template status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({
    example: false,
    description: 'Updated active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GenerateDynamicTypeDto {
  @ApiProperty({
    example: DynamicTypeCategory.EQUIPMENT,
    description: 'Type category to generate',
    enum: DynamicTypeCategory,
  })
  @IsEnum(DynamicTypeCategory)
  category!: DynamicTypeCategory;

  @ApiProperty({
    example: 'game-uuid-123',
    description: 'Game context ID',
  })
  @IsString()
  gameId!: string;

  @ApiProperty({
    example:
      'The player is exploring a volcanic dungeon filled with fire elementals...',
    description: 'Story context for generation',
    required: false,
  })
  @IsOptional()
  @IsString()
  storyContext?: string;

  @ApiProperty({
    example: ['fire', 'weapon'],
    description: 'Required tags',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTags?: string[];

  @ApiProperty({
    example: ['water', 'ice'],
    description: 'Forbidden tags',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forbiddenTags?: string[];

  @ApiProperty({
    example: [70, 90],
    description: 'Power level range [min, max]',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  powerLevelRange?: [number, number];

  @ApiProperty({
    example: [TagRarity.RARE, TagRarity.LEGENDARY],
    description: 'Allowed rarities',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TagRarity, { each: true })
  allowedRarities?: TagRarity[];

  @ApiProperty({
    example: 3,
    description: 'Number of types to generate',
    required: false,
    default: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  count?: number;

  @ApiProperty({
    example: 'Create a weapon that embodies the essence of phoenix fire',
    description: 'Custom generation prompt',
    required: false,
  })
  @IsOptional()
  @IsString()
  customPrompt?: string;
}

export class TagCombinationRequestDto {
  @ApiProperty({
    example: ['fire', 'weapon', 'legendary'],
    description: 'Tag names to combine',
  })
  @IsArray()
  @IsString({ each: true })
  tagNames!: string[];

  @ApiProperty({
    example: DynamicTypeCategory.EQUIPMENT,
    description: 'Target category',
    enum: DynamicTypeCategory,
  })
  @IsEnum(DynamicTypeCategory)
  category!: DynamicTypeCategory;

  @ApiProperty({
    example: { damage: 80, durability: 400 },
    description: 'Base properties to start with',
    required: false,
  })
  @IsOptional()
  @IsObject()
  baseProperties?: Record<string, any>;
}
