import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// Character Template DTOs
export class CharacterTemplateDto {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Template category',
    enum: ['global', 'setting_specific', 'custom'],
  })
  @IsEnum(['global', 'setting_specific', 'custom'])
  category: 'global' | 'setting_specific' | 'custom';

  @ApiProperty({
    description: 'World types this template applies to',
    required: false,
  })
  @IsArray()
  @IsOptional()
  worldTypes?: string[];

  @ApiProperty({ description: 'Default backstory for this template' })
  @IsString()
  @IsNotEmpty()
  backstory: string;

  @ApiProperty({ description: 'Default attributes for this template' })
  @IsObject()
  attributes: Record<string, number>;

  @ApiProperty({ description: 'Default skills for this template' })
  @IsArray()
  skills: string[];

  @ApiProperty({ description: 'Default starting items for this template' })
  @IsArray()
  startingItems: string[];

  @ApiProperty({ description: 'Default traits for this template' })
  @IsArray()
  traits: string[];
}

// Character Creation Step DTOs
export class CharacterCreationStepDto {
  @ApiProperty({
    description: 'Current step',
    enum: ['template', 'backstory', 'stats', 'finalize'],
  })
  @IsEnum(['template', 'backstory', 'stats', 'finalize'])
  step: 'template' | 'backstory' | 'stats' | 'finalize';

  @ApiProperty({ description: 'Whether this step is completed' })
  @IsBoolean()
  completed: boolean;

  @ApiProperty({ description: 'Step data' })
  @IsObject()
  data: Record<string, any>;
}

// Template Selection DTO
export class SelectTemplateDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Selected template ID' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'Whether to use custom backstory',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  useCustomBackstory?: boolean;

  @ApiProperty({ description: 'Custom backstory text', required: false })
  @IsString()
  @IsOptional()
  customBackstory?: string;
}

// Backstory Analysis DTO
export class AnalyzeBackstoryDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Backstory text to analyze' })
  @IsString()
  @IsNotEmpty()
  backstory: string;

  @ApiProperty({ description: 'World type for context', required: false })
  @IsString()
  @IsOptional()
  worldType?: string;

  @ApiProperty({
    description: 'Selected template ID for context',
    required: false,
  })
  @IsString()
  @IsOptional()
  templateId?: string;
}

// Stats Allocation DTO
export class AllocateStatsDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Final stats allocation' })
  @IsObject()
  stats: Record<string, number>;

  @ApiProperty({
    description: 'Whether to accept AI suggestions',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  acceptAiSuggestions?: boolean;

  @ApiProperty({ description: 'Total points used' })
  @IsNumber()
  @Min(0)
  totalPointsUsed: number;
}

// Finalize Character DTO
export class FinalizeCharacterDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Final character stats' })
  @IsObject()
  finalStats: Record<string, number>;

  @ApiProperty({ description: 'Selected traits', required: false })
  @IsArray()
  @IsOptional()
  selectedTraits?: string[];

  @ApiProperty({
    description: 'Whether to save as custom template',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  saveAsTemplate?: boolean;

  @ApiProperty({ description: 'Custom template name', required: false })
  @IsString()
  @IsOptional()
  templateName?: string;
}

// Get Templates DTO
export class GetTemplatesDto {
  @ApiProperty({
    description: 'World type to filter templates',
    required: false,
  })
  @IsString()
  @IsOptional()
  worldType?: string;

  @ApiProperty({ description: 'Template category to filter', required: false })
  @IsEnum(['global', 'setting_specific', 'custom'])
  @IsOptional()
  category?: 'global' | 'setting_specific' | 'custom';

  @ApiProperty({
    description: 'Whether to include user custom templates',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeCustom?: boolean;
}

// Point Allocation Rule DTO
export class PointAllocationRuleDto {
  @ApiProperty({ description: 'Stat name' })
  @IsString()
  @IsNotEmpty()
  statName: string;

  @ApiProperty({ description: 'Base cost per point' })
  @IsNumber()
  @Min(1)
  baseCost: number;

  @ApiProperty({ description: 'Scaling factor for higher values' })
  @IsNumber()
  @Min(1)
  scalingFactor: number;

  @ApiProperty({ description: 'Maximum value for this stat' })
  @IsNumber()
  @Min(1)
  maxValue: number;

  @ApiProperty({ description: 'Minimum value for this stat' })
  @IsNumber()
  @Min(0)
  minValue: number;

  @ApiProperty({
    description: 'Stat category',
    enum: ['core', 'derived', 'social', 'world_specific', 'custom'],
  })
  @IsEnum(['core', 'derived', 'social', 'world_specific', 'custom'])
  category: 'core' | 'derived' | 'social' | 'world_specific' | 'custom';
}

// Character Creation Session DTO
export class CharacterCreationSessionDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({
    description: 'Current step',
    enum: ['template', 'backstory', 'stats', 'finalize'],
  })
  @IsEnum(['template', 'backstory', 'stats', 'finalize'])
  currentStep: 'template' | 'backstory' | 'stats' | 'finalize';

  @ApiProperty({ description: 'Completion steps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterCreationStepDto)
  steps: CharacterCreationStepDto[];

  @ApiProperty({ description: 'Selected template', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CharacterTemplateDto)
  selectedTemplate?: CharacterTemplateDto;

  @ApiProperty({ description: 'Custom backstory', required: false })
  @IsString()
  @IsOptional()
  customBackstory?: string;

  @ApiProperty({ description: 'AI suggested stats', required: false })
  @IsObject()
  @IsOptional()
  aiSuggestedStats?: Record<string, number>;

  @ApiProperty({ description: 'Final stats', required: false })
  @IsObject()
  @IsOptional()
  finalStats?: Record<string, number>;

  @ApiProperty({ description: 'Total points allocated' })
  @IsNumber()
  @Min(0)
  totalPointsAllocated: number;

  @ApiProperty({ description: 'Maximum points allowed' })
  @IsNumber()
  @Min(0)
  maxPointsAllowed: number;
}

// Backstory Analysis Response DTO
export class BackstoryAnalysisResponseDto {
  @ApiProperty({ description: 'Detected character archetype' })
  @IsString()
  characterArchetype: string;

  @ApiProperty({ description: 'AI suggested stats' })
  @IsObject()
  suggestedStats: Record<string, number>;

  @ApiProperty({ description: 'AI reasoning for suggestions' })
  @IsString()
  reasoning: string;

  @ApiProperty({ description: 'Confidence level (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({ description: 'Detected keywords from backstory' })
  @IsArray()
  detectedKeywords: string[];

  @ApiProperty({ description: 'World context adjustments' })
  @IsObject()
  worldContextAdjustments: Record<string, number>;
}

// Character Creation Result DTO
export class CharacterCreationResultDto {
  @ApiProperty({ description: 'Final character stats' })
  @IsObject()
  characterStats: Record<string, string | number | undefined>;

  @ApiProperty({ description: 'Selected template', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CharacterTemplateDto)
  selectedTemplate?: CharacterTemplateDto;

  @ApiProperty({ description: 'Custom backstory used', required: false })
  @IsString()
  @IsOptional()
  customBackstory?: string;

  @ApiProperty({ description: 'AI analysis result', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackstoryAnalysisResponseDto)
  aiAnalysis?: BackstoryAnalysisResponseDto;

  @ApiProperty({ description: 'Total points used in creation' })
  @IsNumber()
  @Min(0)
  totalPointsUsed: number;

  @ApiProperty({
    description: 'Creation method used',
    enum: ['template', 'ai_analysis', 'custom', 'hybrid'],
  })
  @IsEnum(['template', 'ai_analysis', 'custom', 'hybrid'])
  creationMethod: 'template' | 'ai_analysis' | 'custom' | 'hybrid';
}

// Create Custom Template DTO
export class CreateCustomTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'World types this template applies to',
    required: false,
  })
  @IsArray()
  @IsOptional()
  worldTypes?: string[];

  @ApiProperty({ description: 'Template backstory' })
  @IsString()
  @IsNotEmpty()
  backstory: string;

  @ApiProperty({ description: 'Template attributes' })
  @IsObject()
  attributes: Record<string, number>;

  @ApiProperty({ description: 'Template skills' })
  @IsArray()
  skills: string[];

  @ApiProperty({ description: 'Template starting items' })
  @IsArray()
  startingItems: string[];

  @ApiProperty({ description: 'Template traits' })
  @IsArray()
  traits: string[];
}

// Update Character Creation Session DTO
export class UpdateCharacterCreationSessionDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({
    description: 'Step to update',
    enum: ['template', 'backstory', 'stats', 'finalize'],
  })
  @IsEnum(['template', 'backstory', 'stats', 'finalize'])
  step: 'template' | 'backstory' | 'stats' | 'finalize';

  @ApiProperty({ description: 'Step data to update' })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ description: 'Mark step as completed', required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
