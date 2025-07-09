import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ActionType } from '../../common/types/game-engine.types';

export class GameActionDto {
  @ApiPropertyOptional({
    description: 'The choice number (1-5) selected by the player',
    example: 2,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @ValidateIf((o) => !o.action && !o.think && !o.communication && !o.actionType)
  choiceNumber?: number;

  @ApiPropertyOptional({
    description: 'Custom action input by the player',
    example: 'Investigate the strange sound coming from the bushes',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o) => !o.choiceNumber && !o.think && !o.communication && !o.actionType,
  )
  action?: string;

  @ApiPropertyOptional({
    description: "The character's thoughts or internal monologue",
    example: 'I wonder if I should trust this merchant...',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf(
    (o) => !o.choiceNumber && !o.action && !o.communication && !o.actionType,
  )
  think?: string;

  @ApiPropertyOptional({
    description: 'Communication with other characters',
    example: 'Hello stranger, where can I find the nearest inn?',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.choiceNumber && !o.action && !o.think && !o.actionType)
  communication?: string;

  // Thêm các trường mới
  @ApiPropertyOptional({
    description: 'Type of action (can be predefined or custom)',
    example: 'custom',
    enum: ActionType,
  })
  @IsOptional()
  @IsEnum(ActionType, { message: 'actionType must be a valid ActionType' })
  actionType?: ActionType | string;

  @ApiPropertyOptional({
    description: 'Target of the action (NPC, item, location)',
    example: 'Old Merchant',
    type: String,
  })
  @IsOptional()
  @IsString()
  actionTarget?: string;

  @ApiPropertyOptional({
    description: 'Context of the action',
    example: 'marketplace',
    type: String,
  })
  @IsOptional()
  @IsString()
  actionContext?: string;

  @ApiPropertyOptional({
    description: 'Intensity of the action (0-100)',
    example: 75,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  actionIntensity?: number;

  @ApiPropertyOptional({
    description: 'Intent of the player',
    example: 'gather information',
    type: String,
  })
  @IsOptional()
  @IsString()
  actionIntent?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the action',
    example: { mood: 'suspicious', tone: 'friendly' },
    type: 'object',
    additionalProperties: true, // Add the required additionalProperties field
  })
  @IsOptional()
  @IsObject()
  actionMetadata?: Record<string, unknown>;
}
