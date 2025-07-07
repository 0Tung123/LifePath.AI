import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class NpcInteractionDto {
  @ApiProperty({ description: 'Type of interaction', example: 'conversation' })
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Outcome of the interaction',
    example: 'positive',
  })
  @IsString()
  outcome!: string;

  @ApiProperty({
    description: 'Impact on relationship (-100 to 100)',
    example: 10,
  })
  @IsNumber()
  @Min(-100)
  @Max(100)
  impact!: number;
}

export class UpdateNpcRelationshipDto {
  @ApiProperty({ description: 'NPC ID (if known)', example: 'npc_123' })
  @IsString()
  npcId!: string;

  @ApiProperty({ description: 'NPC name', example: 'Old Merchant' })
  @IsString()
  npcName!: string;

  @ApiPropertyOptional({
    description: 'Relationship level (-100 to 100)',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  relationshipLevel?: number;

  @ApiPropertyOptional({
    description: 'Relationship status',
    example: 'friend',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'New interaction to add' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcInteractionDto)
  newInteraction?: NpcInteractionDto;

  @ApiPropertyOptional({
    description: 'New memories to add',
    example: ['Helped during the storm', 'Shared a meal'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newMemories?: string[];

  @ApiPropertyOptional({
    description: 'Current location of the NPC',
    example: 'Town Square',
  })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({
    description: 'Current activity of the NPC',
    example: 'selling goods',
  })
  @IsOptional()
  @IsString()
  currentActivity?: string;
}
