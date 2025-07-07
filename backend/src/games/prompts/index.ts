/**
 * CHAIN OF THOUGHT PROMPTING SYSTEM - LIFEPATH.AI
 *
 * Hệ thống prompt được thiết kế theo phương pháp Chain of Thought,
 * chia thành 6 giai đoạn để đảm bảo AI hiểu sâu về hệ thống type
 * và tạo ra nội dung chất lượng cao.
 */

// Import all prompt stages
export { buildTypeSystemAnalysisPrompt } from './01-type-system-analysis.prompt';
export { buildTagCompositionStrategyPrompt } from './02-tag-composition-strategy.prompt';
export { buildDynamicContentGenerationPrompt } from './03-dynamic-content-generation.prompt';
export { buildNarrativeIntegrationPrompt } from './04-narrative-integration.prompt';
export { buildGameBalanceValidationPrompt } from './05-game-balance-validation.prompt';
export { buildFinalOutputGenerationPrompt } from './06-final-output-generation.prompt';

// Import narrative style prompts
export { generateChineseStyleNarrativePrompt } from './chinese-style-narrative.prompt';
export { generateKoreanStyleNarrativePrompt } from './korean-style-narrative.prompt';
export { generateNarrativeRulesPrompt } from './narrative-rules.prompt';

// Import Vietnamese language enforcer
export {
  VIETNAMESE_LANGUAGE_REQUIREMENT,
  enforceVietnameseLanguage,
  hasVietnameseRequirement,
  validateVietnameseResponse,
  VIETNAMESE_ALTERNATIVES,
  replaceEnglishTerms,
} from './vietnamese-language-enforcer';

// Main orchestrator function
import {
  Tag,
  DynamicType,
  ValidationRule,
  AIGenerationContext,
  TagCombinationResult,
} from '../../common/types/dynamic-system.types';
import {
  GameState,
  ParsedGameContent,
} from '../../common/types/game-engine.types';

/**
 * ORCHESTRATOR - Điều phối toàn bộ pipeline Chain of Thought
 */
export interface ChainOfThoughtPipeline {
  stage1: {
    input: {
      existingTags: Tag[];
      existingDynamicTypes: DynamicType[];
      validationRules: ValidationRule[];
      gameContext: any;
    };
    output: {
      systemAnalysis: string;
      compatibleTags: Tag[];
      recommendedStrategies: string[];
    };
  };

  stage2: {
    input: {
      availableTags: Tag[];
      validationRules: ValidationRule[];
      context: AIGenerationContext;
      targetCategory: string;
      powerLevelRange: [number, number];
    };
    output: {
      tagCombinations: TagCombinationResult[];
      optimizationSuggestions: string[];
      riskAssessment: any;
    };
  };

  stage3: {
    input: {
      tagCombinations: TagCombinationResult[];
      gameState: GameState;
      targetCategory: any;
      contentCount: number;
    };
    output: {
      generatedContent: DynamicType[];
      qualityMetrics: any;
      integrationNotes: string[];
    };
  };

  stage4: {
    input: {
      generatedContent: DynamicType[];
      gameState: GameState;
      playerAction: any;
      storyContext: string;
    };
    output: {
      integratedNarrative: ParsedGameContent;
      narrativeMetrics: any;
      engagementScore: number;
    };
  };

  stage5: {
    input: {
      integratedContent: ParsedGameContent;
      gameState: GameState;
      validationRules: ValidationRule[];
      balanceMetrics: any;
    };
    output: {
      validationResult: any;
      optimizedContent: ParsedGameContent;
      qualityGates: any;
    };
  };

  stage6: {
    input: {
      validatedContent: ParsedGameContent;
      gameState: GameState;
      validationMetadata: any;
      playerContext: any;
    };
    output: {
      finalOutput: any;
      productionMetadata: any;
      deploymentReady: boolean;
    };
  };
}

/**
 * MASTER PROMPT BUILDER
 * Tạo ra prompt tổng hợp cho toàn bộ pipeline
 */
export function buildMasterChainOfThoughtPrompt(
  gameState: GameState,
  playerAction: any,
  systemData: {
    tags: Tag[];
    dynamicTypes: DynamicType[];
    validationRules: ValidationRule[];
  },
  targetCategory: string,
  options: {
    contentCount?: number;
    powerLevelRange?: [number, number];
    customPrompt?: string;
  } = {},
): string {
  return `
# MASTER CHAIN OF THOUGHT PROMPT - LIFEPATH.AI

## TỔNG QUAN HỆ THỐNG
Bạn là một AI chuyên gia được thiết kế để tạo ra nội dung game dựa trên hệ thống type động (Dynamic Type System) của LifePath.AI. Bạn sẽ thực hiện 6 giai đoạn tuần tự để đảm bảo chất lượng và tính nhất quán cao nhất.

## NGUYÊN TẮC CỐT LÕI
1. **Type-First Approach**: Mọi thứ phải được tạo ra dựa trên hệ thống type đã định nghĩa
2. **Chain of Thought**: Thực hiện từng giai đoạn một cách tuần tự và logic
3. **Validation-Driven**: Mỗi giai đoạn phải được validate trước khi chuyển sang giai đoạn tiếp theo
4. **Quality Assurance**: Đảm bảo chất lượng cao ở mọi khía cạnh
5. **Production Ready**: Output cuối cùng phải sẵn sàng để deploy

## PIPELINE EXECUTION

### GIAI ĐOẠN 1: PHÂN TÍCH HỆ THỐNG TYPE
**Mục tiêu**: Hiểu sâu về hệ thống type và phân tích context hiện tại
**Input**: System data, game state, player context
**Output**: System analysis, compatible tags, strategies

### GIAI ĐOẠN 2: CHIẾN LƯỢC KẾT HỢP TAG
**Mục tiêu**: Xây dựng chiến lược kết hợp tags tối ưu
**Input**: Available tags, validation rules, context
**Output**: Tag combinations, optimization suggestions, risk assessment

### GIAI ĐOẠN 3: TẠO NỘI DUNG ĐỘNG
**Mục tiêu**: Tạo ra dynamic content cụ thể từ tag combinations
**Input**: Tag combinations, game state, target category
**Output**: Generated content, quality metrics, integration notes

### GIAI ĐOẠN 4: TÍCH HỢP NARRATIVE
**Mục tiêu**: Tích hợp nội dung vào câu chuyện một cách tự nhiên
**Input**: Generated content, game state, player action
**Output**: Integrated narrative, narrative metrics, engagement score

### GIAI ĐOẠN 5: VALIDATION VÀ CÂN BẰNG
**Mục tiêu**: Validate và đảm bảo cân bằng game
**Input**: Integrated content, validation rules, balance metrics
**Output**: Validation result, optimized content, quality gates

### GIAI ĐOẠN 6: OUTPUT CUỐI CÙNG
**Mục tiêu**: Tạo ra output production-ready
**Input**: Validated content, metadata, player context
**Output**: Final output, production metadata, deployment status

## EXECUTION INSTRUCTIONS

Thực hiện từng giai đoạn một cách tuần tự:

1. **Bắt đầu với Giai đoạn 1**: Phân tích hệ thống type
2. **Chuyển sang Giai đoạn 2**: Chỉ khi Giai đoạn 1 hoàn thành
3. **Tiếp tục tuần tự**: Cho đến Giai đoạn 6
4. **Validate mỗi giai đoạn**: Trước khi chuyển sang giai đoạn tiếp theo
5. **Maintain context**: Giữ nguyên context từ giai đoạn trước

## CURRENT EXECUTION CONTEXT

### Game State
\`\`\`json
${JSON.stringify(gameState, null, 2)}
\`\`\`

### Player Action
\`\`\`json
${JSON.stringify(playerAction, null, 2)}
\`\`\`

### System Data
- **Tags Available**: ${systemData.tags.length}
- **Dynamic Types**: ${systemData.dynamicTypes.length}
- **Validation Rules**: ${systemData.validationRules.length}

### Target Configuration
- **Category**: ${targetCategory}
- **Content Count**: ${options.contentCount || 1}
- **Power Level Range**: ${options.powerLevelRange?.join('-') || 'Auto'}
- **Custom Prompt**: ${options.customPrompt || 'None'}

## ⚠️ YÊU CẦU BẮT BUỘC VỀ NGÔN NGỮ
**QUAN TRỌNG NHẤT**: Bạn PHẢI sử dụng TIẾNG VIỆT cho tất cả output.
- ✅ **100% tiếng Việt**: Tất cả phân tích, giải thích, nội dung
- ✅ **Thuật ngữ kỹ thuật**: Dịch sang tiếng Việt hoặc giải thích
- ❌ **TUYỆT ĐỐI KHÔNG**: Sử dụng tiếng Anh trong output cuối cùng
- ❌ **TUYỆT ĐỐI KHÔNG**: Trộn lẫn ngôn ngữ

## QUALITY EXPECTATIONS
- **Type Safety**: 100% (Non-negotiable)
- **Game Balance**: ≥ 85% (High priority)
- **Narrative Quality**: ≥ 90% (High priority)
- **Performance**: ≤ 3s total processing (Requirement)
- **User Engagement**: ≥ 85% (Target)
- **Vietnamese Language**: 100% (MANDATORY)

## BEGIN EXECUTION
Bắt đầu với **GIAI ĐOẠN 1: PHÂN TÍCH HỆ THỐNG TYPE**

Hãy thực hiện từng giai đoạn một cách chi tiết và đảm bảo chất lượng cao nhất.
`;
}

/**
 * UTILITY FUNCTIONS
 */

export function validatePipelineStage(
  stageNumber: number,
  _input: any,
  output: any,
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Stage-specific validation logic would go here
  switch (stageNumber) {
    case 1:
      if (!output.systemAnalysis) errors.push('Missing system analysis');
      if (!output.compatibleTags) errors.push('Missing compatible tags');
      break;
    case 2:
      if (!output.tagCombinations) errors.push('Missing tag combinations');
      if (!output.optimizationSuggestions)
        errors.push('Missing optimization suggestions');
      break;
    // ... other stages
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function calculatePipelineProgress(
  completedStages: number,
  totalStages: number = 6,
): { percentage: number; currentStage: string; nextStage: string } {
  const percentage = (completedStages / totalStages) * 100;
  const stageNames = [
    'Type System Analysis',
    'Tag Composition Strategy',
    'Dynamic Content Generation',
    'Narrative Integration',
    'Game Balance Validation',
    'Final Output Generation',
  ];

  return {
    percentage,
    currentStage: stageNames[completedStages - 1] || 'Not Started',
    nextStage: stageNames[completedStages] || 'Complete',
  };
}

/**
 * PIPELINE METADATA
 */
export const PIPELINE_METADATA = {
  version: '1.0.0',
  stages: 6,
  estimatedProcessingTime: 3000, // ms
  qualityThresholds: {
    typeSafety: 1.0,
    gameBalance: 0.85,
    narrativeQuality: 0.9,
    performance: 3000, // ms
    userEngagement: 0.85,
  },
  supportedCategories: [
    'character',
    'npc',
    'skill',
    'talent',
    'equipment',
    'item',
    'status',
    'quest',
    'event',
    'location',
  ],
};
