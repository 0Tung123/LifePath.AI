import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StatusEffectDto {
  @ApiProperty({ description: 'Status effect ID', example: 'effect_123' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Status effect name', example: 'Poisoned' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Status effect description',
    example: 'Taking damage over time from poison',
  })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Duration in turns/actions', example: 3 })
  @IsNumber()
  @Min(1)
  duration!: number;

  @ApiPropertyOptional({
    description: 'Intensity of the effect (1-10)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  intensity?: number;

  @ApiPropertyOptional({
    description: 'Source of the effect',
    example: 'Venomous Spider Bite',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Type of effect', example: 'debuff' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Effects on stats or attributes' })
  @IsObject()
  effects!: Record<string, number | string>;

  @ApiPropertyOptional({
    description: 'Visual indicators',
    example: ['Green skin', 'Nausea'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visualEffects?: string[];

  @ApiPropertyOptional({
    description: 'Possible cures',
    example: ['Antidote Potion', 'Healing Spell'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cures?: string[];
}

export class UpdateStatusEffectsDto {
  @ApiPropertyOptional({ description: 'Status effects to add' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusEffectDto)
  addEffects?: StatusEffectDto[];

  @ApiPropertyOptional({
    description: 'IDs of status effects to remove',
    example: ['effect_123', 'effect_456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeEffects?: string[];

  @ApiPropertyOptional({ description: 'IDs of status effects to update' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusEffectDto)
  updateEffects?: StatusEffectDto[];
}
