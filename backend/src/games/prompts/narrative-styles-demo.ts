import { GameSettingsDto, GameTheme } from '../dto/create-game.dto';
import {
  generateChineseStyleNarrativePrompt,
  generateKoreanStyleNarrativePrompt,
  generateNarrativeRulesPrompt,
} from './index';

/**
 * DEMO: Cách sử dụng các prompt phong cách viết truyện
 */

// Tạo sample game settings
const sampleGameSettings: GameSettingsDto = {
  theme: GameTheme.FANTASY,
  setting: 'Thế giới tu tiên với các tông phái và linh thú',
  characterName: 'Lý Thiên Phong',
  characterBackstory:
    'Một thiếu niên từ làng quê nghèo khó, có tài năng tu luyện ẩn giấu',
  additionalSettings: {
    difficulty: 'medium' as any,
    gameLength: 'long' as any,
    enableRomance: true,
    enableFactions: true,
  },
};

/**
 * Demo sử dụng Chinese Style Narrative Prompt
 */
export function demoChineseStylePrompt() {
  console.log('=== CHINESE STYLE NARRATIVE PROMPT ===');
  const prompt = generateChineseStyleNarrativePrompt(sampleGameSettings);
  console.log(prompt);
  return prompt;
}

/**
 * Demo sử dụng Korean Style Narrative Prompt
 */
export function demoKoreanStylePrompt() {
  console.log('=== KOREAN STYLE NARRATIVE PROMPT ===');
  const prompt = generateKoreanStyleNarrativePrompt(sampleGameSettings);
  console.log(prompt);
  return prompt;
}

/**
 * Demo sử dụng Narrative Rules Prompt
 */
export function demoNarrativeRulesPrompt() {
  console.log('=== NARRATIVE RULES PROMPT ===');
  const prompt = generateNarrativeRulesPrompt(sampleGameSettings);
  console.log(prompt);
  return prompt;
}

/**
 * Demo tất cả các prompt styles
 */
export function demoAllNarrativeStyles() {
  console.log('🎮 LIFEPATH.AI - NARRATIVE STYLES DEMO\n');

  // Chinese Style
  console.log('📚 1. PHONG CÁCH TRUNG QUỐC');
  demoChineseStylePrompt();
  console.log('\n' + '='.repeat(80) + '\n');

  // Korean Style
  console.log('🎯 2. PHONG CÁCH HÀN QUỐC');
  demoKoreanStylePrompt();
  console.log('\n' + '='.repeat(80) + '\n');

  // Rules
  console.log('📋 3. QUY TẮC CHUNG');
  demoNarrativeRulesPrompt();
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('✅ Demo completed successfully!');
}

/**
 * Utility function để tạo prompt theo style
 */
export function generatePromptByStyle(
  style: 'chinese' | 'korean' | 'rules',
  gameSettings: GameSettingsDto,
): string {
  switch (style) {
    case 'chinese':
      return generateChineseStyleNarrativePrompt(gameSettings);
    case 'korean':
      return generateKoreanStyleNarrativePrompt(gameSettings);
    case 'rules':
      return generateNarrativeRulesPrompt(gameSettings);
    default:
      throw new Error(`Unknown narrative style: ${style}`);
  }
}

/**
 * Validate prompt output
 */
export function validatePromptOutput(prompt: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    length: number;
    sections: number;
    hasCharacterInfo: boolean;
    hasInstructions: boolean;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt is empty');
  }

  if (prompt.length < 500) {
    warnings.push('Prompt might be too short');
  }

  if (prompt.length > 5000) {
    warnings.push('Prompt might be too long');
  }

  // Content validation
  const hasCharacterInfo =
    prompt.includes('characterName') || prompt.includes('Tên');
  const hasInstructions =
    prompt.includes('YÊU CẦU') || prompt.includes('HƯỚNG DẪN');
  const sections = (prompt.match(/###/g) || []).length;

  if (!hasCharacterInfo) {
    errors.push('Missing character information');
  }

  if (!hasInstructions) {
    errors.push('Missing instructions section');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      length: prompt.length,
      sections,
      hasCharacterInfo,
      hasInstructions,
    },
  };
}

// Export for testing
export const NARRATIVE_STYLES = {
  CHINESE: 'chinese' as const,
  KOREAN: 'korean' as const,
  RULES: 'rules' as const,
} as const;

export type NarrativeStyle =
  (typeof NARRATIVE_STYLES)[keyof typeof NARRATIVE_STYLES];
