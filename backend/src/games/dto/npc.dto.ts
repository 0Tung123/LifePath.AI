import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NPCDiscoveryStage {
  HIDDEN = 'hidden',
  MENTIONED = 'mentioned',
  DETAILED = 'detailed',
  FAMILIAR = 'familiar',
}

export enum NPCRelationshipStatus {
  UNKNOWN = 'unknown',
  STRANGER = 'stranger',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  ALLY = 'ally',
  ENEMY = 'enemy',
  RIVAL = 'rival',
  ROMANTIC = 'romantic',
}

export enum NPCCurrentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MISSING = 'missing',
  DECEASED = 'deceased',
}

export enum NPCImportance {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum NPCInteractionType {
  MENTIONED = 'mentioned',
  DIALOGUE = 'dialogue',
  COMBAT = 'combat',
  TRADE = 'trade',
  QUEST = 'quest',
  OBSERVATION = 'observation',
}

export class CreateNPCDto {
  @ApiProperty({ description: 'NPC name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'NPC description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Original lore data from AI', required: false })
  @IsOptional()
  @IsObject()
  loreData?: object;

  @ApiProperty({ enum: NPCDiscoveryStage, default: NPCDiscoveryStage.HIDDEN })
  @IsOptional()
  @IsEnum(NPCDiscoveryStage)
  discoveryStage?: NPCDiscoveryStage;

  @ApiProperty({
    enum: NPCRelationshipStatus,
    default: NPCRelationshipStatus.UNKNOWN,
  })
  @IsOptional()
  @IsEnum(NPCRelationshipStatus)
  relationshipStatus?: NPCRelationshipStatus;

  @ApiProperty({ description: 'Relationship score (-100 to 100)', default: 0 })
  @IsOptional()
  @IsNumber()
  relationshipScore?: number;

  @ApiProperty({ description: 'Known attributes list', default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownAttributes?: string[];

  @ApiProperty({ description: 'Hidden attributes list', default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiddenAttributes?: string[];

  @ApiProperty({ description: 'Last seen location', required: false })
  @IsOptional()
  @IsString()
  lastSeenAt?: string;

  @ApiProperty({ description: 'Last seen chapter', required: false })
  @IsOptional()
  @IsNumber()
  lastSeenChapter?: number;

  @ApiProperty({ enum: NPCCurrentStatus, default: NPCCurrentStatus.ACTIVE })
  @IsOptional()
  @IsEnum(NPCCurrentStatus)
  currentStatus?: NPCCurrentStatus;

  @ApiProperty({ enum: NPCImportance, default: NPCImportance.MINOR })
  @IsOptional()
  @IsEnum(NPCImportance)
  importance?: NPCImportance;

  @ApiProperty({ description: 'NPC faction', required: false })
  @IsOptional()
  @IsString()
  faction?: string;

  @ApiProperty({ description: 'NPC role', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateNPCDto {
  @ApiProperty({ description: 'NPC name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'NPC description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: NPCDiscoveryStage, required: false })
  @IsOptional()
  @IsEnum(NPCDiscoveryStage)
  discoveryStage?: NPCDiscoveryStage;

  @ApiProperty({ enum: NPCRelationshipStatus, required: false })
  @IsOptional()
  @IsEnum(NPCRelationshipStatus)
  relationshipStatus?: NPCRelationshipStatus;

  @ApiProperty({
    description: 'Relationship score (-100 to 100)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  relationshipScore?: number;

  @ApiProperty({ description: 'Known attributes list', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownAttributes?: string[];

  @ApiProperty({ description: 'Hidden attributes list', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiddenAttributes?: string[];

  @ApiProperty({ description: 'Last seen location', required: false })
  @IsOptional()
  @IsString()
  lastSeenAt?: string;

  @ApiProperty({ description: 'Last seen chapter', required: false })
  @IsOptional()
  @IsNumber()
  lastSeenChapter?: number;

  @ApiProperty({ enum: NPCCurrentStatus, required: false })
  @IsOptional()
  @IsEnum(NPCCurrentStatus)
  currentStatus?: NPCCurrentStatus;

  @ApiProperty({ enum: NPCImportance, required: false })
  @IsOptional()
  @IsEnum(NPCImportance)
  importance?: NPCImportance;

  @ApiProperty({ description: 'NPC faction', required: false })
  @IsOptional()
  @IsString()
  faction?: string;

  @ApiProperty({ description: 'NPC role', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateNPCInteractionDto {
  @ApiProperty({ enum: NPCInteractionType })
  @IsEnum(NPCInteractionType)
  interactionType: NPCInteractionType;

  @ApiProperty({ description: 'Interaction context' })
  @IsString()
  context: string;

  @ApiProperty({ description: 'Chapter number' })
  @IsNumber()
  chapterNumber: number;

  @ApiProperty({
    description: 'Relationship change from this interaction',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  relationshipChange?: number;

  @ApiProperty({
    description: 'Attributes discovered in this interaction',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  discoveredAttributes?: string[];
}

export class NPCBatchUpdateDto {
  @ApiProperty({ description: 'List of NPC updates' })
  @IsArray()
  updates: Array<{
    npcId: string;
    updates: Partial<UpdateNPCDto>;
  }>;
}
