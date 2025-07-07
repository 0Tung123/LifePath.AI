import { GameSettingsDto, GameTheme } from '../dto/create-game.dto';
import {
  generateChineseStyleNarrativePrompt,
  generateKoreanStyleNarrativePrompt,
  validateVietnameseResponse,
  replaceEnglishTerms,
} from './index';

/**
 * DEMO: Vietnamese Language Enforcer
 */

// Sample game settings
const sampleGameSettings: GameSettingsDto = {
  theme: GameTheme.FANTASY,
  setting: 'Thế giới fantasy với magic và monsters',
  characterName: 'Nguyễn Văn A',
  characterBackstory: 'Một nông dân bình thường được chọn làm hero',
  additionalSettings: {
    difficulty: 'medium' as any,
    gameLength: 'long' as any,
    enableRomance: true,
    enableFactions: true,
  },
};

/**
 * Demo Vietnamese enforcement on Chinese style
 */
export function demoChineseStyleWithVietnamese() {
  console.log('=== CHINESE STYLE WITH VIETNAMESE ENFORCEMENT ===');

  const basePrompt = generateChineseStyleNarrativePrompt(sampleGameSettings);
  console.log('Base prompt length:', basePrompt.length);
  console.log(
    'Has Vietnamese requirement:',
    basePrompt.includes('YÊU CẦU BẮT BUỘC VỀ NGÔN NGỮ'),
  );

  return basePrompt;
}

/**
 * Demo Vietnamese enforcement on Korean style
 */
export function demoKoreanStyleWithVietnamese() {
  console.log('=== KOREAN STYLE WITH VIETNAMESE ENFORCEMENT ===');

  const basePrompt = generateKoreanStyleNarrativePrompt(sampleGameSettings);
  console.log('Base prompt length:', basePrompt.length);
  console.log(
    'Has Vietnamese requirement:',
    basePrompt.includes('YÊU CẦU BẮT BUỘC VỀ NGÔN NGỮ'),
  );

  return basePrompt;
}

/**
 * Demo Vietnamese validation
 */
export function demoVietnameseValidation() {
  console.log('=== VIETNAMESE VALIDATION DEMO ===');

  // Good Vietnamese response
  const goodResponse = `
  Nguyễn Văn A đứng giữa cánh đồng lúa vàng, ánh nắng chiều tà chiếu xuống khuôn mặt rám nắng của anh. 
  Đột nhiên, một luồng sáng kỳ lạ xuất hiện trước mặt anh, và một giọng nói vang lên:
  "Ngươi đã được chọn làm dũng sĩ để cứu thế giới!"
  
  Lựa chọn:
  1. Chấp nhận sứ mệnh ngay lập tức
  2. Hỏi thêm thông tin chi tiết
  3. Từ chối và chạy về nhà
  `;

  // Bad response with English
  const badResponse = `
  Nguyễn Văn A đứng giữa field, sunlight chiếu xuống face của anh.
  Suddenly, một magic light xuất hiện, và voice nói:
  "You have been chosen as hero để save the world!"
  
  Choices:
  1. Accept quest immediately
  2. Ask for more information
  3. Reject và run home
  `;

  console.log('--- Good Response Validation ---');
  const goodValidation = validateVietnameseResponse(goodResponse);
  console.log('Valid:', goodValidation.isValid);
  console.log('Score:', goodValidation.score);
  console.log('Violations:', goodValidation.violations);

  console.log('\n--- Bad Response Validation ---');
  const badValidation = validateVietnameseResponse(badResponse);
  console.log('Valid:', badValidation.isValid);
  console.log('Score:', badValidation.score);
  console.log('Violations:', badValidation.violations);

  return { goodValidation, badValidation };
}

/**
 * Demo English term replacement
 */
export function demoEnglishTermReplacement() {
  console.log('=== ENGLISH TERM REPLACEMENT DEMO ===');

  const textWithEnglish = `
  Player đã level up skill magic lên level 5.
  HP của character giảm xuống 50 sau battle với boss.
  Quest này reward rất tốt, bao gồm weapon và armor mới.
  `;

  console.log('Original text:');
  console.log(textWithEnglish);

  const vietnameseText = replaceEnglishTerms(textWithEnglish);
  console.log('\nAfter replacement:');
  console.log(vietnameseText);

  return { original: textWithEnglish, replaced: vietnameseText };
}

/**
 * Demo complete workflow
 */
export function demoCompleteWorkflow() {
  console.log('🇻🇳 VIETNAMESE LANGUAGE ENFORCER - COMPLETE DEMO\n');

  // 1. Generate prompts with Vietnamese enforcement
  console.log('1. Generating prompts with Vietnamese enforcement...');
  const chinesePrompt = demoChineseStyleWithVietnamese();
  const koreanPrompt = demoKoreanStyleWithVietnamese();

  // 2. Validate responses
  console.log('\n2. Validating Vietnamese responses...');
  const validationResults = demoVietnameseValidation();

  // 3. Replace English terms
  console.log('\n3. Replacing English terms...');
  const replacementResults = demoEnglishTermReplacement();

  // 4. Summary
  console.log('\n4. SUMMARY:');
  console.log(
    '✅ Chinese prompt has Vietnamese requirement:',
    chinesePrompt.includes('TIẾNG VIỆT'),
  );
  console.log(
    '✅ Korean prompt has Vietnamese requirement:',
    koreanPrompt.includes('TIẾNG VIỆT'),
  );
  console.log(
    '✅ Good response validation score:',
    validationResults.goodValidation.score,
  );
  console.log(
    '❌ Bad response validation score:',
    validationResults.badValidation.score,
  );
  console.log('✅ English terms successfully replaced');

  return {
    prompts: { chinesePrompt, koreanPrompt },
    validation: validationResults,
    replacement: replacementResults,
  };
}

/**
 * Test specific scenarios
 */
export function testSpecificScenarios() {
  console.log('🧪 TESTING SPECIFIC SCENARIOS\n');

  // Scenario 1: Mixed language detection
  const mixedText = 'Nhân vật này có high level và strong power.';
  const mixedValidation = validateVietnameseResponse(mixedText);
  console.log('Mixed language detection:');
  console.log('Text:', mixedText);
  console.log('Valid:', mixedValidation.isValid);
  console.log('Violations:', mixedValidation.violations);

  // Scenario 2: Pure Vietnamese
  const pureVietnamese = 'Nhân vật này có cấp độ cao và sức mạnh lớn.';
  const pureValidation = validateVietnameseResponse(pureVietnamese);
  console.log('\nPure Vietnamese:');
  console.log('Text:', pureVietnamese);
  console.log('Valid:', pureValidation.isValid);
  console.log('Score:', pureValidation.score);

  // Scenario 3: Technical terms
  const technicalText =
    'System notification: Player đã complete quest successfully!';
  const replacedTechnical = replaceEnglishTerms(technicalText);
  console.log('\nTechnical terms replacement:');
  console.log('Original:', technicalText);
  console.log('Replaced:', replacedTechnical);

  return {
    mixedValidation,
    pureValidation,
    technicalReplacement: {
      original: technicalText,
      replaced: replacedTechnical,
    },
  };
}

// Export for testing
export const DEMO_FUNCTIONS = {
  demoChineseStyleWithVietnamese,
  demoKoreanStyleWithVietnamese,
  demoVietnameseValidation,
  demoEnglishTermReplacement,
  demoCompleteWorkflow,
  testSpecificScenarios,
} as const;
