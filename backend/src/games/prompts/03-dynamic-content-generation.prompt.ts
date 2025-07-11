/**
 * GIAI ĐOẠN 3: TẠO NỘI DUNG ĐỘNG
 * Prompt này hướng dẫn AI tạo ra dynamic content dựa trên tag combinations đã được phân tích
 */

import {
  DynamicTypeCategory,
  TagCombinationResult,
} from '../../common/types/dynamic-system.types';
import { GameState } from '../../common/types/game-engine.types';

export function buildDynamicContentGenerationPrompt(
  tagCombinations: TagCombinationResult[],
  gameState: GameState,
  targetCategory: DynamicTypeCategory,
  contentCount: number = 1,
): string {
  return `
# GIAI ĐOẠN 3: TẠO NỘI DUNG ĐỘNG - LIFEPATH.AI

## NHIỆM VỤ
Dựa trên các tag combinations đã được phân tích và validate, bây giờ bạn cần tạo ra nội dung game cụ thể, chi tiết và phù hợp với bối cảnh.

## THÔNG TIN GAME STATE HIỆN TẠI
\`\`\`json
{
  "gameId": "${gameState.id}",
  "userId": "${gameState.userId}",
  "settings": ${JSON.stringify(gameState.settings, null, 2)},
  "characterStats": ${JSON.stringify(gameState.characterStats, null, 2)},
  "currentPrompt": "${gameState.currentPrompt}",
  "karmaScore": ${gameState.karmaScore},
  "reputation": ${JSON.stringify(gameState.reputation, null, 2)},
  "worldState": ${JSON.stringify(gameState.worldState, null, 2)},
  "playerLevel": ${gameState.characterStats.level || 'Unknown'},
  "storyProgress": "${gameState.storyHistory.length} chapters completed"
}
\`\`\`

## TAG COMBINATIONS ĐÃ ĐƯỢC PHÂN TÍCH
${tagCombinations
  .map(
    (combo, index) => `
### Combination ${index + 1} (Power Level: ${combo.powerLevel}, Rarity: ${combo.rarity})
- **Tags**: ${combo.suggestedProperties ? Object.keys(combo.suggestedProperties).join(', ') : 'N/A'}
- **Synergies**: ${combo.synergies.length} hiệu ứng
${combo.synergies.map((synergy) => `  - ${synergy.effect.name}: ${synergy.effect.description}`).join('\n')}
- **Conflicts**: ${combo.conflicts.join(', ') || 'Không có'}
- **Warnings**: ${combo.warnings?.join(', ') || 'Không có'}
- **Suggested Properties**: ${JSON.stringify(combo.suggestedProperties, null, 2)}
`,
  )
  .join('\n')}

## TARGET CATEGORY: ${targetCategory.toUpperCase()}
Tạo ${contentCount} ${targetCategory} phù hợp với bối cảnh game hiện tại.

## NGUYÊN TẮC TẠO NỘI DUNG

### 1. NARRATIVE COHERENCE (Tính nhất quán câu chuyện)
- **World Building**: Phù hợp với thế giới game đã được thiết lập
- **Character Arc**: Hỗ trợ sự phát triển của nhân vật
- **Story Progression**: Đẩy câu chuyện tiến triển một cách tự nhiên
- **Emotional Impact**: Tạo ra cảm xúc và kết nối với người chơi

### 2. MECHANICAL BALANCE (Cân bằng cơ chế)
- **Power Scaling**: Phù hợp với level và tiến độ của người chơi
- **Risk vs Reward**: Cân bằng giữa thử thách và phần thưởng
- **Progression Logic**: Logic tiến triển hợp lý và thỏa mãn
- **Interaction Depth**: Độ sâu tương tác phong phú

### 3. TYPE SAFETY COMPLIANCE (Tuân thủ Type Safety)
- **Interface Adherence**: Tuân thủ chính xác các TypeScript interfaces
- **Property Validation**: Tất cả properties phải có type và giá trị hợp lệ
- **Relationship Integrity**: Mối quan hệ giữa các objects phải nhất quán
- **Data Structure**: Cấu trúc dữ liệu phải chính xác và đầy đủ

## TEMPLATE TẠO NỘI DUNG THEO CATEGORY

### CHARACTER/NPC Template
\`\`\`typescript
interface GeneratedCharacter extends DynamicType {
  category: DynamicTypeCategory.CHARACTER | DynamicTypeCategory.NPC;
  characterSpecific: {
    appearance: string;
    personality: string[];
    background: string;
    motivations: string[];
    relationships: Array<{
      targetId: string;
      type: 'ally' | 'enemy' | 'neutral' | 'romantic';
      strength: number; // -100 to 100
    }>;
    dialogue: {
      greeting: string[];
      farewell: string[];
      combat: string[];
      special: string[];
    };
    abilities: Array<{
      name: string;
      description: string;
      cooldown: number;
      effects: Record<string, number>;
    }>;
  };
}
\`\`\`

### EQUIPMENT/ITEM Template
\`\`\`typescript
interface GeneratedEquipment extends DynamicType {
  category: DynamicTypeCategory.EQUIPMENT | DynamicTypeCategory.ITEM;
  equipmentSpecific: {
    slot: 'weapon' | 'armor' | 'accessory' | 'consumable';
    requirements: {
      level?: number;
      stats?: Record<string, number>;
      class?: string[];
    };
    effects: {
      passive: Record<string, number>;
      active?: {
        name: string;
        description: string;
        cooldown: number;
        cost: Record<string, number>;
        effects: Record<string, number>;
      };
    };
    durability?: {
      current: number;
      maximum: number;
      repairCost: number;
    };
    upgrade?: {
      materials: Array<{
        name: string;
        quantity: number;
      }>;
      cost: number;
      nextTier: string;
    };
  };
}
\`\`\`

### SKILL/TALENT Template
\`\`\`typescript
interface GeneratedSkill extends DynamicType {
  category: DynamicTypeCategory.SKILL | DynamicTypeCategory.TALENT;
  skillSpecific: {
    type: 'active' | 'passive' | 'toggle';
    requirements: {
      level: number;
      prerequisites: string[];
      stats: Record<string, number>;
    };
    costs: {
      mana?: number;
      stamina?: number;
      health?: number;
      items?: Array<{
        name: string;
        quantity: number;
      }>;
    };
    effects: {
      immediate: Record<string, number>;
      duration?: number;
      overtime?: Record<string, number>;
    };
    scaling: {
      attribute: string;
      ratio: number;
    };
    evolution: {
      nextTier?: string;
      requirements: Record<string, number>;
    };
  };
}
\`\`\`

### QUEST/EVENT Template
\`\`\`typescript
interface GeneratedQuest extends DynamicType {
  category: DynamicTypeCategory.QUEST | DynamicTypeCategory.EVENT;
  questSpecific: {
    type: 'main' | 'side' | 'daily' | 'hidden' | 'chain';
    objectives: Array<{
      id: string;
      description: string;
      type: 'kill' | 'collect' | 'talk' | 'explore' | 'survive';
      target: string;
      quantity: number;
      completed: boolean;
    }>;
    rewards: {
      experience: number;
      items: Array<{
        name: string;
        quantity: number;
        rarity: string;
      }>;
      reputation: Record<string, number>;
      unlocks: string[];
    };
    conditions: {
      level: number;
      prerequisites: string[];
      timeLimit?: number;
      location?: string;
    };
    narrative: {
      introduction: string;
      progression: string[];
      completion: string;
      failure?: string;
    };
  };
}
\`\`\`

## GENERATION ALGORITHM

### Step 1: Context Analysis
\`\`\`typescript
function analyzeGenerationContext(
  gameState: GameState,
  tagCombinations: TagCombinationResult[]
): GenerationContext {
  return {
    playerPowerLevel: calculatePlayerPowerLevel(gameState),
    storyPhase: determineStoryPhase(gameState),
    worldState: gameState.worldState,
    availableResources: calculateAvailableResources(gameState),
    narrativeNeeds: identifyNarrativeNeeds(gameState),
    balanceRequirements: calculateBalanceRequirements(gameState)
  };
}
\`\`\`

### Step 2: Content Generation
\`\`\`typescript
function generateDynamicContent(
  context: GenerationContext,
  targetCategory: DynamicTypeCategory,
  tagCombination: TagCombinationResult
): DynamicType {
  const baseContent = createBaseContent(targetCategory, tagCombination);
  const enhancedContent = applyTagEffects(baseContent, tagCombination);
  const balancedContent = applyBalancing(enhancedContent, context);
  const narrativeContent = addNarrativeElements(balancedContent, context);
  
  return validateAndFinalize(narrativeContent);
}
\`\`\`

### Step 3: Quality Assurance
\`\`\`typescript
function validateGeneratedContent(content: DynamicType): ValidationResult {
  const typeCheck = validateTypeCompliance(content);
  const balanceCheck = validateGameBalance(content);
  const narrativeCheck = validateNarrativeCoherence(content);
  const performanceCheck = validatePerformanceImpact(content);
  
  return {
    isValid: typeCheck.valid && balanceCheck.valid && narrativeCheck.valid,
    errors: [...typeCheck.errors, ...balanceCheck.errors, ...narrativeCheck.errors],
    warnings: [...typeCheck.warnings, ...balanceCheck.warnings, ...narrativeCheck.warnings],
    score: calculateQualityScore(content)
  };
}
\`\`\`

## OUTPUT REQUIREMENTS

Tạo ra ${contentCount} ${targetCategory} với format sau:

\`\`\`json
{
  "generatedContent": [
    {
      "id": "generated-uuid",
      "name": "Tên nội dung",
      "description": "Mô tả chi tiết, sinh động và hấp dẫn",
      "category": "${targetCategory}",
      "tags": ["tag1", "tag2", "tag3"],
      "baseProperties": {
        "property1": value1,
        "property2": value2
      },
      "computedProperties": {
        "computed1": calculatedValue1,
        "computed2": calculatedValue2
      },
      "activeSynergies": [
        {
          "requiredTags": ["tag1", "tag2"],
          "effect": {
            "type": "stat_bonus",
            "name": "Synergy Name",
            "description": "Synergy Description",
            "effects": {
              "stat": value
            }
          }
        }
      ],
      "rarity": "rare",
      "powerLevel": 75,
      "createdBy": {
        "type": "ai",
        "aiModel": "gemini-2.5-pro",
        "context": "Generated for current game context"
      },
      "isTemplate": false,
      "categorySpecific": {
        // Category-specific properties based on templates above
      },
      "generationMetadata": {
        "confidence": 0.95,
        "balanceScore": 0.88,
        "narrativeFit": 0.92,
        "technicalCompliance": 1.0
      }
    }
  ],
  "generationSummary": {
    "totalGenerated": ${contentCount},
    "averageQuality": 0.91,
    "balanceIssues": [],
    "narrativeCoherence": 0.93,
    "recommendedUsage": "Immediate integration into game"
  }
}
\`\`\`

## QUALITY METRICS
- **Type Compliance**: 100% (Bắt buộc)
- **Balance Score**: ≥ 0.8 (Khuyến nghị)
- **Narrative Fit**: ≥ 0.85 (Khuyến nghị)
- **Performance Impact**: ≤ 0.1 (Tối đa)
- **Player Engagement**: ≥ 0.9 (Mục tiêu)

**Lưu ý**: Tất cả nội dung được tạo phải có thể integrate trực tiếp vào game mà không cần chỉnh sửa thêm.
`;
}
