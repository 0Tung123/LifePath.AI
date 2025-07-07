import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GameEventConditionDto {
  @ApiProperty({ description: 'Condition type', example: 'stat' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Target of the condition', example: 'strength' })
  @IsString()
  target!: string;

  @ApiProperty({ description: 'Operator for comparison', example: '>' })
  @IsString()
  operator!: string;

  @ApiProperty({ description: 'Value to compare against', example: 50 })
  value!: number | string | boolean;
}

export class GameEventConsequenceDto {
  @ApiProperty({ description: 'Type of consequence', example: 'stat_change' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Target of the consequence', example: 'health' })
  @IsString()
  target!: string;

  @ApiProperty({ description: 'Value or change to apply' })
  value!: number | string | boolean | Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Duration of the consequence',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class GameEventDto {
  @ApiProperty({ description: 'Event ID', example: 'event_123' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Event name', example: 'Sudden Storm' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Event description',
    example: 'A violent storm appears suddenly',
  })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Event type', example: 'weather' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    description: 'Probability of occurrence (0-100)',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ description: 'Conditions for the event to trigger' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameEventConditionDto)
  conditions?: GameEventConditionDto[];

  @ApiPropertyOptional({ description: 'Immediate consequences of the event' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameEventConsequenceDto)
  immediateEffects?: GameEventConsequenceDto[];

  @ApiPropertyOptional({ description: 'Long-term consequences of the event' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameEventConsequenceDto)
  longTermEffects?: GameEventConsequenceDto[];

  @ApiPropertyOptional({
    description: 'Related NPCs',
    example: ['Fisherman', 'Village Elder'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedNpcs?: string[];

  @ApiPropertyOptional({
    description: 'Related locations',
    example: ['Harbor', 'Coastal Village'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedLocations?: string[];

  @ApiPropertyOptional({
    description: 'Duration in game time units',
    example: 24,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Custom event attributes' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}

export class UpdateGameEventDto {
  @ApiPropertyOptional({ description: 'Events to add to the game' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameEventDto)
  addEvents?: GameEventDto[];

  @ApiPropertyOptional({
    description: 'IDs of events to remove',
    example: ['event_123', 'event_456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeEvents?: string[];

  @ApiPropertyOptional({ description: 'Events to update' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameEventDto)
  updateEvents?: GameEventDto[];
}
