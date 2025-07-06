// Character Creation Types for Frontend
export interface CharacterAttribute {
  name: string;
  value: number;
  description?: string;
  category: 'core' | 'derived' | 'social' | 'world_specific' | 'custom';
  baseCost?: number;
  scalingFactor?: number;
  maxValue?: number;
  minValue?: number;
}

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'global' | 'setting_specific' | 'custom';
  worldTypes?: string[];
  backstory: string;
  attributes: Record<string, number>;
  skills: string[];
  startingItems: string[];
  traits: string[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterCreationStep {
  step: 'template' | 'backstory' | 'stats' | 'finalize';
  completed: boolean;
  data: Record<string, unknown>;
}

export interface CharacterCreationSession {
  gameId: string;
  userId: string;
  currentStep: 'template' | 'backstory' | 'stats' | 'finalize';
  steps: CharacterCreationStep[];
  selectedTemplate?: CharacterTemplate;
  customBackstory?: string;
  aiSuggestedStats?: Record<string, number>;
  finalStats?: Record<string, number>;
  totalPointsAllocated: number;
  maxPointsAllowed: number;
  createdAt: string;
  updatedAt: string;
}

// Sync with backend BackstoryAnalysisResponseDto
export interface BackstoryAnalysis {
  characterArchetype: string;
  suggestedStats: Record<string, number>;
  reasoning: string;
  confidence: number;
  detectedKeywords: string[];
  worldContextAdjustments: Record<string, number>;
}

export interface PointAllocationRule {
  statName: string;
  baseCost: number;
  scalingFactor: number;
  maxValue: number;
  minValue: number;
  category: 'core' | 'derived' | 'social' | 'world_specific' | 'custom';
}

export interface PointAllocationSystem {
  totalPoints: number;
  bonusPoints: number;
  rules: PointAllocationRule[];
  worldType: string;
}

// Sync with backend CharacterCreationResultDto
export interface CharacterCreationResult {
  characterStats: Record<string, string | number | undefined>;
  selectedTemplate?: CharacterTemplate;
  customBackstory?: string;
  aiAnalysis?: BackstoryAnalysis;
  totalPointsUsed: number;
  creationMethod: 'template' | 'ai_analysis' | 'custom' | 'hybrid';
}

// DTOs for API calls
export interface SelectTemplateDto {
  gameId: string;
  templateId: string;
  useCustomBackstory?: boolean;
  customBackstory?: string;
}

export interface AnalyzeBackstoryDto {
  gameId: string;
  backstory: string;
  worldType?: string;
  templateId?: string;
}

export interface AllocateStatsDto {
  gameId: string;
  stats: Record<string, number>;
  acceptAiSuggestions?: boolean;
  totalPointsUsed: number;
}

export interface FinalizeCharacterDto {
  gameId: string;
  finalStats: Record<string, number>;
  selectedTraits?: string[];
  saveAsTemplate?: boolean;
  templateName?: string;
}

export interface CreateCustomTemplateDto {
  name: string;
  description: string;
  worldTypes?: string[];
  backstory: string;
  attributes: Record<string, number>;
  skills: string[];
  startingItems: string[];
  traits: string[];
}

export interface GetTemplatesDto {
  worldType?: string;
  category?: 'global' | 'setting_specific' | 'custom';
  includeCustom?: boolean;
}

// UI State interfaces
export interface CharacterCreationState {
  currentStep: 'template' | 'backstory' | 'stats' | 'finalize';
  gameId: string;

  // Template step
  availableTemplates: CharacterTemplate[];
  selectedTemplate?: CharacterTemplate;

  // Backstory step
  backstoryText: string;
  useCustomBackstory: boolean;
  aiAnalysis?: BackstoryAnalysis;
  isAnalyzing: boolean;

  // Stats step
  currentStats: Record<string, number>;
  pointAllocationRules: PointAllocationRule[];
  pointsUsed: number;
  maxPoints: number;

  // Finalize step
  finalResult?: CharacterCreationResult;

  // UI state
  isLoading: boolean;
  error?: string;
  warnings: string[];
}

// Component Props interfaces
export interface TemplateSelectionProps {
  templates: CharacterTemplate[];
  selectedTemplate?: CharacterTemplate;
  onTemplateSelect: (template: CharacterTemplate) => void;
  worldType: string;
  isLoading?: boolean;
}

export interface BackstoryEditorProps {
  initialBackstory: string;
  onBackstoryChange: (backstory: string) => void;
  onAnalyzeBackstory: () => void;
  aiAnalysis?: BackstoryAnalysis;
  isAnalyzing?: boolean;
  useCustomBackstory: boolean;
  onToggleCustomBackstory: (useCustom: boolean) => void;
}

export interface StatsEditorProps {
  stats: Record<string, number>;
  onStatsChange: (stats: Record<string, number>) => void;
  pointAllocationRules: PointAllocationRule[];
  pointsUsed: number;
  maxPoints: number;
  aiSuggestedStats?: Record<string, number>;
  onAcceptAiSuggestions?: () => void;
}

export interface CharacterCreationWizardProps {
  gameId: string;
  worldType: string;
  onComplete: (result: CharacterCreationResult) => void;
  onCancel: () => void;
}

// Utility types
export type StatCategory =
  | 'core'
  | 'derived'
  | 'social'
  | 'world_specific'
  | 'custom';
export type CreationMethod = 'template' | 'ai_analysis' | 'custom' | 'hybrid';
export type TemplateCategory = 'global' | 'setting_specific' | 'custom';
export type CharacterCreationStepType =
  | 'template'
  | 'backstory'
  | 'stats'
  | 'finalize';

// Validation interfaces
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface StatsValidationResult extends ValidationResult {
  totalPointsUsed: number;
  maxPointsAllowed: number;
  individualStatErrors: Record<string, string[]>;
}

// API Response types
export interface CharacterCreationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Step completion tracking
export interface StepCompletionStatus {
  template: boolean;
  backstory: boolean;
  stats: boolean;
  finalize: boolean;
}

// Character progression preview
export interface CharacterPreview {
  name: string;
  archetype: string;
  primaryStats: Record<string, number>;
  suggestedPlayStyle: string;
  strengths: string[];
  weaknesses: string[];
  recommendedSkills: string[];
}

// World-specific stat mappings
export interface WorldSpecificStats {
  [worldType: string]: {
    uniqueStats: string[];
    coreStatMappings: Record<string, string>;
    derivedStatFormulas: Record<string, string>;
  };
}

// Template filtering and sorting
export interface TemplateFilters {
  category?: TemplateCategory;
  worldType?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'category' | 'created' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Character creation analytics
export interface CharacterCreationAnalytics {
  stepStartTime: Record<CharacterCreationStepType, Date>;
  stepCompletionTime: Record<CharacterCreationStepType, Date>;
  totalCreationTime: number;
  templatesViewed: string[];
  aiAnalysisUsed: boolean;
  statsManuallyAdjusted: boolean;
  customTemplateCreated: boolean;
}

export default CharacterCreationState;
