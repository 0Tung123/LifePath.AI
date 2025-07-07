/**
 * GIAI ĐOẠN 4: TÍCH HỢP NARRATIVE
 * Prompt này hướng dẫn AI tích hợp nội dung đã tạo vào câu chuyện một cách tự nhiên và hấp dẫn
 */

import { DynamicType } from '../../common/types/dynamic-system.types';
import { GameState } from '../../common/types/game-engine.types';

export function buildNarrativeIntegrationPrompt(
  generatedContent: DynamicType[],
  gameState: GameState,
  playerAction: any,
  _storyContext: string,
): string {
  return `
# GIAI ĐOẠN 4: TÍCH HỢP NARRATIVE - LIFEPATH.AI

## NHIỆM VỤ
Tích hợp nội dung động đã được tạo ra vào câu chuyện game một cách tự nhiên, hấp dẫn và có ý nghĩa. Đảm bảo tính liên tục của narrative và tạo ra trải nghiệm immersive cho người chơi.

## THÔNG TIN GAME STATE HIỆN TẠI

### Character Information
\`\`\`json
{
  "characterName": "${gameState.settings.characterName}",
  "background": "${gameState.settings.background}",
  "world": "${gameState.settings.world}",
  "level": ${gameState.characterStats.level || 1},
  "karmaScore": ${gameState.karmaScore},
  "reputation": ${JSON.stringify(gameState.reputation, null, 2)}
}
\`\`\`

### Current World State
\`\`\`json
${JSON.stringify(gameState.worldState, null, 2)}
\`\`\`

### Recent Story History (Last 5 entries)
${gameState.storyHistory
  .slice(-5)
  .map(
    (entry, index) => `
**Entry ${index + 1}** (${entry.type}):
${entry.content}
*Timestamp: ${entry.timestamp}*
${entry.worldImpact ? `*World Impact: ${JSON.stringify(entry.worldImpact, null, 2)}*` : ''}
`,
  )
  .join('\n')}

### NPC Relationships
${gameState.npcRelationships
  .map(
    (npc) => `
**${npc.npcName}** (Level: ${npc.relationshipLevel}, Status: ${npc.status})
- Location: ${npc.currentLocation || 'Unknown'}
- Activity: ${npc.currentActivity || 'Unknown'}
- Recent Interactions: ${npc.interactions.length}
- Memories: ${npc.memories.join(', ')}
`,
  )
  .join('\n')}

### Player Action Context
\`\`\`json
${JSON.stringify(playerAction, null, 2)}
\`\`\`

## NỘI DUNG ĐỘNG ĐÃ ĐƯỢC TẠO
${generatedContent
  .map(
    (content, index) => `
### Generated Content ${index + 1}: ${content.name}
- **Category**: ${content.category}
- **Description**: ${content.description}
- **Tags**: ${content.tags.join(', ')}
- **Power Level**: ${content.powerLevel}
- **Rarity**: ${content.rarity}
- **Base Properties**: ${JSON.stringify(content.baseProperties, null, 2)}
- **Computed Properties**: ${JSON.stringify(content.computedProperties, null, 2)}
- **Active Synergies**: ${content.activeSynergies?.length || 0} effects
${content.activeSynergies?.map((synergy) => `  - ${synergy.effect.name}: ${synergy.effect.description}`).join('\n') || ''}
`,
  )
  .join('\n')}

## NGUYÊN TẮC TÍCH HỢP NARRATIVE

### 1. SEAMLESS INTEGRATION (Tích hợp liền mạch)
- **Natural Flow**: Nội dung xuất hiện một cách tự nhiên trong câu chuyện
- **Contextual Relevance**: Phù hợp với bối cảnh và tình huống hiện tại
- **Character Agency**: Tôn trọng quyền tự quyết của nhân vật
- **World Consistency**: Nhất quán với thế giới đã được thiết lập

### 2. EMOTIONAL ENGAGEMENT (Kết nối cảm xúc)
- **Personal Stakes**: Tạo ra mối quan tâm cá nhân cho nhân vật
- **Emotional Resonance**: Gây ra phản ứng cảm xúc từ người chơi
- **Character Development**: Hỗ trợ sự phát triển của nhân vật
- **Meaningful Choices**: Tạo ra các lựa chọn có ý nghĩa

### 3. MECHANICAL INTEGRATION (Tích hợp cơ chế)
- **Gameplay Impact**: Ảnh hưởng đến gameplay một cách có ý nghĩa
- **Progressive Revelation**: Tiết lộ thông tin một cách từ từ
- **Interactive Elements**: Tạo ra các yếu tố tương tác
- **Consequence System**: Hệ thống hậu quả rõ ràng

## NARRATIVE INTEGRATION STRATEGIES

### Strategy 1: DISCOVERY NARRATIVE
Khi tích hợp items/equipment/locations:
\`\`\`
"Khi [character action], [character name] phát hiện ra [item/location]. 
[Detailed description with sensory details].
[Connection to character's background/goals].
[Immediate implications and choices]."
\`\`\`

### Strategy 2: ENCOUNTER NARRATIVE  
Khi tích hợp NPCs/enemies:
\`\`\`
"[Setting the scene with atmosphere].
Đột nhiên, [NPC introduction with distinctive features].
[NPC's motivation and connection to current situation].
[Dialogue or action that reveals character].
[Player's options and potential consequences]."
\`\`\`

### Strategy 3: REVELATION NARRATIVE
Khi tích hợp skills/talents/knowledge:
\`\`\`
"Trong khoảnh khắc [triggering moment], [character name] cảm nhận được [internal change].
[Description of the new ability/knowledge manifesting].
[Connection to character's growth/story arc].
[How this changes the current situation]."
\`\`\`

### Strategy 4: EVENT NARRATIVE
Khi tích hợp quests/events:
\`\`\`
"[World state change or external trigger].
[How this affects the immediate environment/NPCs].
[Character's realization of the situation].
[Stakes and urgency].
[Clear objectives and choices]."
\`\`\`

## NARRATIVE STRUCTURE TEMPLATE

### Opening Hook (50-100 words)
- Set the immediate scene
- Connect to previous action
- Create atmosphere and tension

### Content Introduction (100-200 words)
- Introduce the generated content naturally
- Provide rich sensory details
- Establish relevance to character

### Character Reaction (50-100 words)
- Show character's internal response
- Connect to personality/background
- Build emotional investment

### World Impact (50-100 words)
- Show how this affects the world
- Update NPC reactions
- Establish consequences

### Choice Presentation (50-100 words)
- Present clear options
- Show potential outcomes
- Maintain player agency

## INTEGRATION ALGORITHMS

### Content Placement Algorithm
\`\`\`typescript
function integrateContent(
  content: DynamicType,
  gameState: GameState,
  playerAction: any
): NarrativeIntegration {
  
  // Analyze current context
  const context = analyzeCurrentContext(gameState, playerAction);
  
  // Determine integration method
  const method = selectIntegrationMethod(content, context);
  
  // Generate narrative
  const narrative = generateNarrative(content, method, context);
  
  // Update world state
  const worldUpdates = calculateWorldUpdates(content, gameState);
  
  // Generate choices
  const choices = generateChoices(content, context);
  
  return {
    narrative,
    worldUpdates,
    choices,
    metadata: {
      integrationMethod: method,
      confidence: calculateConfidence(narrative, context),
      coherenceScore: calculateCoherence(narrative, gameState)
    }
  };
}
\`\`\`

### Narrative Flow Algorithm
\`\`\`typescript
function ensureNarrativeFlow(
  previousStory: StoryHistoryEntry[],
  newContent: string,
  gameState: GameState
): FlowAnalysis {
  
  const continuity = analyzeContinuity(previousStory, newContent);
  const pacing = analyzePacing(previousStory, newContent);
  const tension = analyzeTension(newContent, gameState);
  
  return {
    continuityScore: continuity.score,
    pacingScore: pacing.score,
    tensionLevel: tension.level,
    suggestions: [
      ...continuity.suggestions,
      ...pacing.suggestions,
      ...tension.suggestions
    ]
  };
}
\`\`\`

## OUTPUT FORMAT - INTEGRATED NARRATIVE

\`\`\`json
{
  "integratedNarrative": {
    "storyText": "Câu chuyện chính được tích hợp với nội dung mới...",
    "storySegments": [
      {
        "type": "description",
        "content": "Mô tả chi tiết về...",
        "speaker": null,
        "tone": "mysterious",
        "emphasis": "normal"
      },
      {
        "type": "dialogue",
        "content": "Lời thoại của NPC...",
        "speaker": "NPC Name",
        "tone": "urgent",
        "emphasis": "strong"
      }
    ],
    "choices": [
      {
        "text": "Lựa chọn 1 với mô tả chi tiết",
        "number": 1,
        "consequences": ["Hậu quả 1", "Hậu quả 2"],
        "requirements": {
          "level": 5,
          "karma": 10
        }
      }
    ],
    "worldStateChanges": {
      "environment": {
        "weather": "stormy",
        "conditions": ["magical_disturbance"]
      },
      "society": {
        "tensions": {
          "guild_vs_nobles": 75
        }
      }
    },
    "npcUpdates": [
      {
        "npcId": "npc-uuid",
        "npcName": "NPC Name",
        "changes": {
          "relationshipLevel": 5,
          "currentActivity": "investigating"
        },
        "newDialogue": ["New dialogue option"],
        "locationChange": "new_location"
      }
    ],
    "triggeredEvents": [
      {
        "id": "event-uuid",
        "name": "Event Name",
        "description": "Event description",
        "type": "discovery",
        "immediateEffects": ["Effect 1"],
        "longTermEffects": ["Long term effect"]
      }
    ],
    "loreFragments": [
      {
        "id": "lore-uuid",
        "title": "New Lore",
        "content": "Lore content",
        "type": "item",
        "category": "discovery",
        "importance": "medium",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "integrationMetadata": {
    "contentIntegrated": ${generatedContent.length},
    "narrativeCoherence": 0.95,
    "playerEngagement": 0.88,
    "worldConsistency": 0.92,
    "choiceQuality": 0.90,
    "integrationMethod": "discovery",
    "processingTime": 1250
  },
  "qualityAssurance": {
    "typeCompliance": true,
    "narrativeFlow": true,
    "characterConsistency": true,
    "worldLogic": true,
    "balanceCheck": true,
    "errors": [],
    "warnings": []
  }
}
\`\`\`

## QUALITY STANDARDS
- **Narrative Coherence**: ≥ 0.9 (Bắt buộc)
- **Character Consistency**: 100% (Bắt buộc)
- **World Logic**: 100% (Bắt buộc)
- **Player Engagement**: ≥ 0.85 (Khuyến nghị)
- **Choice Quality**: ≥ 0.8 (Khuyến nghị)
- **Integration Smoothness**: ≥ 0.9 (Mục tiêu)

**Lưu ý quan trọng**: Narrative phải tạo ra cảm giác như nội dung mới là một phần tự nhiên của thế giới, không phải là thứ được "thêm vào" một cách gượng ép.
`;
}

// Interfaces moved to types file to avoid unused declarations
