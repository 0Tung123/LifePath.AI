/**
 * GIAI ĐOẠN 5: VALIDATION VÀ CÂN BẰNG GAME
 * Prompt này đảm bảo nội dung được tạo ra cân bằng và không phá vỡ game balance
 */

import { ValidationRule } from '../../common/types/dynamic-system.types';
import {
  GameState,
  ParsedGameContent,
  WorldState,
} from '../../common/types/game-engine.types';

export function buildGameBalanceValidationPrompt(
  integratedContent: ParsedGameContent,
  gameState: GameState,
  validationRules: ValidationRule[],
  balanceMetrics: any,
): string {
  return `
# GIAI ĐOẠN 5: VALIDATION VÀ CÂN BẰNG GAME - LIFEPATH.AI

## NHIỆM VỤ
Thực hiện validation toàn diện và đảm bảo cân bằng game cho nội dung đã được tích hợp. Đây là giai đoạn cuối cùng trước khi nội dung được đưa vào game thực tế.

## THÔNG TIN VALIDATION

### Current Game State Metrics
\`\`\`json
{
  "playerLevel": ${gameState.characterStats.level || 1},
  "playerPowerLevel": ${calculatePlayerPowerLevel(gameState)},
  "gameProgress": "${gameState.storyHistory.length} chapters",
  "karmaScore": ${gameState.karmaScore},
  "worldDangerLevel": ${calculateWorldDangerLevel(gameState.worldState)},
  "economicState": "${gameState.worldState.society.economicState}",
  "politicalTension": ${JSON.stringify(gameState.worldState.society.tensions, null, 2)}
}
\`\`\`

### Balance Metrics Thresholds
\`\`\`json
${JSON.stringify(balanceMetrics, null, 2)}
\`\`\`

### Validation Rules to Check
${validationRules
  .map(
    (rule) => `
#### ${rule.name} (${rule.severity.toUpperCase()})
- **Category**: ${rule.category}
- **Description**: ${rule.description}
- **Conditions**: 
${rule.conditions.map((condition) => `  - ${condition.type}: ${condition.errorMessage}`).join('\n')}
- **Active**: ${rule.isActive}
`,
  )
  .join('\n')}

## NỘI DUNG CẦN VALIDATION

### Integrated Story Content
\`\`\`
${integratedContent.storyText}
\`\`\`

### Generated Choices
${integratedContent.choices
  .map(
    (choice) => `
**Choice ${choice.number}**: ${choice.text}
- Requirements: ${JSON.stringify(choice.requirements, null, 2)}
- Consequences: ${choice.consequences?.join(', ') || 'None specified'}
`,
  )
  .join('\n')}

### Stats Changes
\`\`\`json
${JSON.stringify(integratedContent.stats, null, 2)}
\`\`\`

### Inventory Changes
${integratedContent.inventory
  .map(
    (item) => `
- **${item.name}** (x${item.quantity})
  - Type: ${item.type || 'Unknown'}
  - Rarity: ${item.rarity || 'common'}
  - Description: ${item.description || 'No description'}
`,
  )
  .join('\n')}

### Skills Changes
${integratedContent.skills
  .map(
    (skill) => `
- **${skill.name}** (Level ${skill.level || 1})
  - Type: ${skill.type || 'Unknown'}
  - Description: ${skill.description || 'No description'}
  - Mastery: ${skill.mastery || 'Novice'}
`,
  )
  .join('\n')}

### World State Changes
\`\`\`json
${JSON.stringify(integratedContent.worldStateChanges, null, 2)}
\`\`\`

### Triggered Events
${
  integratedContent.triggeredEvents
    ?.map(
      (event) => `
- **${event.name}** (${event.type})
  - Description: ${event.description}
  - Immediate Effects: ${event.immediateEffects?.join(', ') || 'None'}
  - Long Term Effects: ${event.longTermEffects?.join(', ') || 'None'}
  - Probability: ${event.probability || 100}%
`,
    )
    .join('\n') || 'No events triggered'
}

## VALIDATION FRAMEWORK

### 1. TYPE SAFETY VALIDATION
\`\`\`typescript
interface TypeSafetyCheck {
  interfaceCompliance: boolean;
  propertyTypes: boolean;
  requiredFields: boolean;
  dataIntegrity: boolean;
  errors: string[];
}

function validateTypeSafety(content: ParsedGameContent): TypeSafetyCheck {
  const errors: string[] = [];
  
  // Check all required fields exist
  if (!content.storyText) errors.push("Missing required field: storyText");
  if (!content.choices || content.choices.length === 0) errors.push("Missing or empty choices array");
  if (!content.stats) errors.push("Missing required field: stats");
  
  // Validate choice structure
  content.choices.forEach((choice, index) => {
    if (typeof choice.number !== 'number') errors.push(\`Choice \${index}: number must be numeric\`);
    if (typeof choice.text !== 'string') errors.push(\`Choice \${index}: text must be string\`);
  });
  
  // Validate inventory items
  content.inventory.forEach((item, index) => {
    if (!item.name) errors.push(\`Inventory item \${index}: missing name\`);
    if (typeof item.quantity !== 'number') errors.push(\`Inventory item \${index}: quantity must be numeric\`);
  });
  
  return {
    interfaceCompliance: errors.length === 0,
    propertyTypes: validatePropertyTypes(content),
    requiredFields: validateRequiredFields(content),
    dataIntegrity: validateDataIntegrity(content),
    errors
  };
}
\`\`\`

### 2. GAME BALANCE VALIDATION
\`\`\`typescript
interface BalanceCheck {
  powerLevel: {
    current: number;
    recommended: number;
    deviation: number;
    acceptable: boolean;
  };
  progression: {
    rate: number;
    sustainable: boolean;
    playerLevel: number;
  };
  economy: {
    inflation: number;
    itemValues: boolean;
    marketImpact: number;
  };
  difficulty: {
    spike: boolean;
    curve: number;
    accessibility: boolean;
  };
}

function validateGameBalance(
  content: ParsedGameContent,
  gameState: GameState,
  metrics: any
): BalanceCheck {
  const playerPowerLevel = calculatePlayerPowerLevel(gameState);
  const contentPowerLevel = calculateContentPowerLevel(content);
  
  return {
    powerLevel: {
      current: contentPowerLevel,
      recommended: playerPowerLevel * 1.1, // 10% above player level
      deviation: Math.abs(contentPowerLevel - playerPowerLevel) / playerPowerLevel,
      acceptable: Math.abs(contentPowerLevel - playerPowerLevel) / playerPowerLevel <= 0.3
    },
    progression: validateProgression(content, gameState),
    economy: validateEconomy(content, gameState),
    difficulty: validateDifficulty(content, gameState)
  };
}
\`\`\`

### 3. NARRATIVE CONSISTENCY VALIDATION
\`\`\`typescript
interface NarrativeCheck {
  characterConsistency: boolean;
  worldLogic: boolean;
  storyFlow: boolean;
  emotionalTone: boolean;
  playerAgency: boolean;
  issues: string[];
}

function validateNarrativeConsistency(
  content: ParsedGameContent,
  gameState: GameState
): NarrativeCheck {
  const issues: string[] = [];
  
  // Check character consistency
  const characterConsistency = validateCharacterBehavior(content, gameState);
  if (!characterConsistency.valid) {
    issues.push(...characterConsistency.issues);
  }
  
  // Check world logic
  const worldLogic = validateWorldLogic(content, gameState);
  if (!worldLogic.valid) {
    issues.push(...worldLogic.issues);
  }
  
  // Check story flow
  const storyFlow = validateStoryFlow(content, gameState);
  if (!storyFlow.valid) {
    issues.push(...storyFlow.issues);
  }
  
  return {
    characterConsistency: characterConsistency.valid,
    worldLogic: worldLogic.valid,
    storyFlow: storyFlow.valid,
    emotionalTone: validateEmotionalTone(content, gameState),
    playerAgency: validatePlayerAgency(content),
    issues
  };
}
\`\`\`

### 4. PERFORMANCE VALIDATION
\`\`\`typescript
interface PerformanceCheck {
  memoryUsage: number;
  processingTime: number;
  databaseImpact: number;
  scalability: boolean;
  optimizations: string[];
}

function validatePerformance(content: ParsedGameContent): PerformanceCheck {
  return {
    memoryUsage: calculateMemoryUsage(content),
    processingTime: estimateProcessingTime(content),
    databaseImpact: calculateDatabaseImpact(content),
    scalability: checkScalability(content),
    optimizations: suggestOptimizations(content)
  };
}
\`\`\`

## VALIDATION EXECUTION

### Step 1: Pre-Validation Analysis
\`\`\`typescript
function preValidationAnalysis(
  content: ParsedGameContent,
  gameState: GameState
): PreValidationResult {
  return {
    contentComplexity: analyzeComplexity(content),
    riskAssessment: assessRisks(content, gameState),
    validationPriority: determineValidationPriority(content),
    estimatedValidationTime: estimateValidationTime(content)
  };
}
\`\`\`

### Step 2: Core Validation
\`\`\`typescript
function executeValidation(
  content: ParsedGameContent,
  gameState: GameState,
  rules: ValidationRule[]
): ValidationResult {
  const typeSafety = validateTypeSafety(content);
  const gameBalance = validateGameBalance(content, gameState, balanceMetrics);
  const narrative = validateNarrativeConsistency(content, gameState);
  const performance = validatePerformance(content);
  const ruleCompliance = validateRuleCompliance(content, rules);
  
  return {
    overall: {
      passed: typeSafety.interfaceCompliance && 
              gameBalance.powerLevel.acceptable && 
              narrative.characterConsistency &&
              performance.scalability,
      score: calculateOverallScore([typeSafety, gameBalance, narrative, performance]),
      confidence: calculateValidationConfidence([typeSafety, gameBalance, narrative, performance])
    },
    details: {
      typeSafety,
      gameBalance,
      narrative,
      performance,
      ruleCompliance
    },
    recommendations: generateRecommendations([typeSafety, gameBalance, narrative, performance])
  };
}
\`\`\`

### Step 3: Post-Validation Optimization
\`\`\`typescript
function optimizeContent(
  content: ParsedGameContent,
  validationResult: ValidationResult
): OptimizedContent {
  let optimizedContent = { ...content };
  
  // Apply balance adjustments
  if (!validationResult.details.gameBalance.powerLevel.acceptable) {
    optimizedContent = adjustPowerLevel(optimizedContent, validationResult.details.gameBalance);
  }
  
  // Fix narrative issues
  if (validationResult.details.narrative.issues.length > 0) {
    optimizedContent = fixNarrativeIssues(optimizedContent, validationResult.details.narrative);
  }
  
  // Apply performance optimizations
  if (validationResult.details.performance.optimizations.length > 0) {
    optimizedContent = applyPerformanceOptimizations(optimizedContent, validationResult.details.performance);
  }
  
  return {
    content: optimizedContent,
    changes: trackChanges(content, optimizedContent),
    revalidationNeeded: requiresRevalidation(validationResult)
  };
}
\`\`\`

## OUTPUT FORMAT - VALIDATION RESULT

\`\`\`json
{
  "validationResult": {
    "overall": {
      "status": "PASSED" | "FAILED" | "WARNING",
      "score": 0.95,
      "confidence": 0.92,
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "typeSafety": {
      "interfaceCompliance": true,
      "propertyTypes": true,
      "requiredFields": true,
      "dataIntegrity": true,
      "errors": []
    },
    "gameBalance": {
      "powerLevel": {
        "current": 75,
        "recommended": 70,
        "deviation": 0.07,
        "acceptable": true
      },
      "progression": {
        "rate": 1.2,
        "sustainable": true,
        "playerLevel": 15
      },
      "economy": {
        "inflation": 0.05,
        "itemValues": true,
        "marketImpact": 0.02
      },
      "difficulty": {
        "spike": false,
        "curve": 1.1,
        "accessibility": true
      }
    },
    "narrativeConsistency": {
      "characterConsistency": true,
      "worldLogic": true,
      "storyFlow": true,
      "emotionalTone": true,
      "playerAgency": true,
      "issues": []
    },
    "performance": {
      "memoryUsage": 2.5,
      "processingTime": 150,
      "databaseImpact": 0.1,
      "scalability": true,
      "optimizations": []
    },
    "ruleCompliance": {
      "passedRules": 15,
      "failedRules": 0,
      "warningRules": 1,
      "details": [
        {
          "ruleName": "Maximum Element Limit",
          "status": "WARNING",
          "message": "Content approaches element limit"
        }
      ]
    }
  },
  "recommendations": [
    {
      "type": "optimization",
      "priority": "low",
      "description": "Consider reducing complexity for better performance",
      "impact": "minor"
    }
  ],
  "optimizations": {
    "applied": [],
    "suggested": [
      {
        "type": "performance",
        "description": "Cache frequently accessed properties",
        "estimatedImprovement": "5%"
      }
    ]
  },
  "finalContent": {
    // Optimized and validated content ready for integration
    "storyText": "Final validated story text...",
    "choices": [...],
    "stats": {...},
    "inventory": [...],
    "skills": [...],
    "worldStateChanges": {...},
    "triggeredEvents": [...]
  },
  "metadata": {
    "validationTime": 250,
    "rulesChecked": 16,
    "optimizationsApplied": 0,
    "confidenceLevel": "high",
    "readyForProduction": true
  }
}
\`\`\`

## QUALITY GATES
- **Type Safety**: 100% (Bắt buộc)
- **Game Balance**: ≥ 0.8 (Bắt buộc)
- **Narrative Consistency**: ≥ 0.9 (Bắt buộc)
- **Performance**: ≤ 200ms processing time (Bắt buộc)
- **Rule Compliance**: 0 failed rules (Bắt buộc)
- **Overall Score**: ≥ 0.85 (Để pass validation)

**Lưu ý**: Chỉ nội dung pass tất cả quality gates mới được đưa vào game. Nội dung fail sẽ được optimize và re-validate.
`;
}

// Helper functions (would be implemented in actual service)
function calculatePlayerPowerLevel(_gameState: GameState): number {
  // Implementation would calculate based on stats, equipment, skills, etc.
  return 70; // Placeholder
}

function calculateWorldDangerLevel(_worldState: WorldState): number {
  // Implementation would analyze world state for danger indicators
  return 50; // Placeholder
}
