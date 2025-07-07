import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  HIDDEN = 'hidden',
}

class QuestObjectiveDto {
  @ApiProperty({
    description: 'Description of the objective',
    example: 'Find the hidden treasure',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Whether the objective is completed',
    example: false,
  })
  @IsBoolean()
  completed!: boolean;

  @ApiPropertyOptional({
    description: 'Whether the objective is optional',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  optional?: boolean;
}

export class UpdateQuestDto {
  @ApiProperty({ description: 'Quest ID', example: 'quest_123' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Quest title', example: 'The Lost Artifact' })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Quest description',
    example: 'Find the ancient artifact hidden in the ruins',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Quest status',
    enum: QuestStatus,
    example: QuestStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(QuestStatus)
  status?: QuestStatus;

  @ApiPropertyOptional({ description: 'Quest progress (0-100)', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Quest objectives' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestObjectiveDto)
  objectives?: QuestObjectiveDto[];

  @ApiPropertyOptional({
    description: 'Quest rewards',
    example: ['Gold x100', 'Magic Sword'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rewards?: string[];

  @ApiPropertyOptional({
    description: 'Related NPCs',
    example: ['Old Wizard', 'Village Chief'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedNpcs?: string[];

  @ApiPropertyOptional({
    description: 'Quest deadline',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  deadline?: Date;
}
