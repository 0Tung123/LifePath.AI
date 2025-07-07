/**
 * GIAI ĐOẠN 6: TẠO OUTPUT CUỐI CÙNG
 * Prompt này tạo ra output cuối cùng đã được validate và tối ưu, sẵn sàng để integrate vào game
 */

import {
  ParsedGameContent,
  GameState,
} from '../../common/types/game-engine.types';

export function buildFinalOutputGenerationPrompt(
  validatedContent: ParsedGameContent,
  gameState: GameState,
  validationMetadata: any,
  playerContext: any,
): string {
  return `
# GIAI ĐOẠN 6: TẠO OUTPUT CUỐI CÙNG - LIFEPATH.AI

## NHIỆM VỤ
Tạo ra output cuối cùng hoàn chỉnh, đã được validate và tối ưu, sẵn sàng để integrate trực tiếp vào game. Đây là sản phẩm cuối cùng của toàn bộ pipeline AI generation.

## THÔNG TIN VALIDATION
\`\`\`json
{
  "validationStatus": "${validationMetadata.overall?.status || 'UNKNOWN'}",
  "overallScore": ${validationMetadata.overall?.score || 0},
  "confidence": ${validationMetadata.overall?.confidence || 0},
  "typeSafety": ${validationMetadata.typeSafety?.interfaceCompliance || false},
  "gameBalance": ${validationMetadata.gameBalance?.powerLevel?.acceptable || false},
  "narrativeConsistency": ${validationMetadata.narrativeConsistency?.characterConsistency || false},
  "performance": ${validationMetadata.performance?.scalability || false},
  "readyForProduction": ${validationMetadata.metadata?.readyForProduction || false}
}
\`\`\`

## VALIDATED CONTENT
\`\`\`json
${JSON.stringify(validatedContent, null, 2)}
\`\`\`

## PLAYER CONTEXT
\`\`\`json
{
  "characterName": "${gameState.settings.characterName}",
  "currentLevel": ${gameState.characterStats.level || 1},
  "karmaScore": ${gameState.karmaScore},
  "worldPhase": "${determineWorldPhase(gameState)}",
  "storyArc": "${determineStoryArc(gameState)}",
  "playerPreferences": ${JSON.stringify(playerContext.preferences || {}, null, 2)},
  "playStyle": "${playerContext.playStyle || 'balanced'}"
}
\`\`\`

## OUTPUT GENERATION PRINCIPLES

### 1. PRODUCTION READINESS
- **Zero Configuration**: Output có thể sử dụng ngay lập tức
- **Complete Integration**: Tất cả dependencies đã được resolve
- **Error Handling**: Robust error handling và fallbacks
- **Performance Optimized**: Đã được tối ưu cho production

### 2. USER EXPERIENCE FOCUS
- **Immersive Narrative**: Câu chuyện hấp dẫn và immersive
- **Meaningful Choices**: Lựa chọn có ý nghĩa và hậu quả rõ ràng
- **Progressive Disclosure**: Thông tin được tiết lộ một cách hợp lý
- **Emotional Engagement**: Tạo kết nối cảm xúc với người chơi

### 3. TECHNICAL EXCELLENCE
- **Type Compliance**: 100% tuân thủ TypeScript interfaces
- **Data Integrity**: Dữ liệu nhất quán và chính xác
- **Scalable Architecture**: Thiết kế có thể mở rộng
- **Maintainable Code**: Code dễ maintain và debug

## FINAL OUTPUT STRUCTURE

### Core Game Content
\`\`\`typescript
interface FinalGameOutput extends ParsedGameContent {
  // Enhanced story with rich formatting
  storyText: string;
  storySegments: ContentSegment[];
  
  // Validated and balanced choices
  choices: EnhancedGameChoice[];
  
  // Optimized stats updates
  stats: OptimizedGameStats;
  
  // Curated inventory changes
  inventory: CuratedInventoryItem[];
  
  // Balanced skill updates
  skills: BalancedCharacterSkill[];
  
  // Rich lore fragments
  lore: EnhancedLoreFragment[];
  
  // Comprehensive world updates
  worldStateChanges: ComprehensiveWorldUpdate;
  
  // Engaging triggered events
  triggeredEvents: EngagingTriggeredEvent[];
  
  // NPC relationship updates
  npcUpdates: DetailedNpcUpdate[];
  
  // Quest progression
  questUpdates: QuestProgressionUpdate[];
  
  // Achievement unlocks
  achievements: Achievement[];
  
  // Status effects
  playerStatusEffects: StatusEffect[];
}
\`\`\`

### Enhanced Choice Structure
\`\`\`typescript
interface EnhancedGameChoice extends GameChoice {
  // Rich description with consequences preview
  text: string;
  number: number;
  
  // Detailed requirements with explanations
  requirements?: {
    level?: number;
    stats?: Record<string, number>;
    items?: string[];
    karma?: number;
    reputation?: Record<string, number>;
    questProgress?: string[];
    explanations: string[]; // Why these requirements exist
  };
  
  // Comprehensive consequence preview
  consequences: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    worldImpact: string[];
    relationshipChanges: string[];
  };
  
  // Choice metadata
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    moralAlignment: 'good' | 'neutral' | 'evil';
    riskLevel: number; // 0-100
    rewardPotential: number; // 0-100
    uniqueness: 'common' | 'rare' | 'unique';
  };
}
\`\`\`

### Rich Story Segments
\`\`\`typescript
interface EnhancedContentSegment {
  type: 'narrative' | 'dialogue' | 'action' | 'description' | 'internal_thought' | 'system_message';
  content: string;
  speaker?: string;
  tone: 'neutral' | 'dramatic' | 'mysterious' | 'urgent' | 'peaceful' | 'tense';
  emphasis: 'normal' | 'strong' | 'subtle';
  
  // Enhanced metadata
  metadata: {
    emotionalWeight: number; // 0-100
    plotImportance: 'low' | 'medium' | 'high' | 'critical';
    characterDevelopment: boolean;
    worldBuilding: boolean;
    foreshadowing: boolean;
  };
  
  // Formatting hints for frontend
  formatting: {
    fontSize?: 'small' | 'normal' | 'large';
    color?: string;
    animation?: 'fade' | 'typewriter' | 'instant';
    sound?: string; // Sound effect to play
  };
}
\`\`\`

## OUTPUT GENERATION ALGORITHM

### Step 1: Content Finalization
\`\`\`typescript
function finalizeContent(
  validatedContent: ParsedGameContent,
  gameState: GameState,
  validationMetadata: any
): FinalGameOutput {
  
  // Enhance story with rich formatting
  const enhancedStory = enhanceStoryPresentation(
    validatedContent.storyText,
    gameState,
    validationMetadata
  );
  
  // Create enhanced choices with full metadata
  const enhancedChoices = enhanceChoices(
    validatedContent.choices,
    gameState,
    validationMetadata
  );
  
  // Optimize all game systems updates
  const optimizedUpdates = optimizeSystemUpdates(
    validatedContent,
    gameState
  );
  
  return {
    ...validatedContent,
    storyText: enhancedStory.text,
    storySegments: enhancedStory.segments,
    choices: enhancedChoices,
    ...optimizedUpdates
  };
}
\`\`\`

### Step 2: Quality Enhancement
\`\`\`typescript
function enhanceQuality(
  finalContent: FinalGameOutput,
  playerContext: any
): EnhancedFinalOutput {
  
  // Personalize content based on player preferences
  const personalizedContent = personalizeForPlayer(finalContent, playerContext);
  
  // Add accessibility features
  const accessibleContent = addAccessibilityFeatures(personalizedContent);
  
  // Optimize for performance
  const optimizedContent = optimizeForPerformance(accessibleContent);
  
  // Add telemetry hooks
  const telemetryContent = addTelemetryHooks(optimizedContent);
  
  return telemetryContent;
}
\`\`\`

### Step 3: Production Packaging
\`\`\`typescript
function packageForProduction(
  enhancedContent: EnhancedFinalOutput,
  metadata: any
): ProductionReadyOutput {
  
  return {
    content: enhancedContent,
    metadata: {
      ...metadata,
      generationPipeline: 'complete',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checksum: calculateChecksum(enhancedContent)
    },
    deployment: {
      environment: 'production',
      rollbackData: createRollbackData(enhancedContent),
      monitoring: createMonitoringHooks(enhancedContent)
    }
  };
}
\`\`\`

## FINAL OUTPUT FORMAT

\`\`\`json
{
  "gameContent": {
    "storyText": "Câu chuyện hoàn chỉnh với formatting phong phú...",
    "storySegments": [
      {
        "type": "narrative",
        "content": "Đoạn mở đầu hấp dẫn...",
        "tone": "mysterious",
        "emphasis": "strong",
        "metadata": {
          "emotionalWeight": 85,
          "plotImportance": "high",
          "characterDevelopment": true,
          "worldBuilding": true,
          "foreshadowing": false
        },
        "formatting": {
          "fontSize": "normal",
          "animation": "typewriter",
          "sound": "ambient_mystery"
        }
      },
      {
        "type": "dialogue",
        "content": "Lời thoại của NPC...",
        "speaker": "Mysterious Stranger",
        "tone": "urgent",
        "emphasis": "normal",
        "metadata": {
          "emotionalWeight": 70,
          "plotImportance": "medium",
          "characterDevelopment": false,
          "worldBuilding": false,
          "foreshadowing": true
        },
        "formatting": {
          "color": "#ff6b6b",
          "animation": "fade"
        }
      }
    ],
    "choices": [
      {
        "text": "Tiếp cận người lạ một cách thận trọng",
        "number": 1,
        "requirements": {
          "level": 5,
          "stats": {
            "wisdom": 15
          },
          "explanations": [
            "Cần đủ kinh nghiệm để đánh giá tình huống",
            "Cần trí tuệ để nhận ra các dấu hiệu nguy hiểm"
          ]
        },
        "consequences": {
          "immediate": [
            "Bạn tiếp cận một cách cẩn thận",
            "Người lạ chú ý đến sự thận trọng của bạn"
          ],
          "shortTerm": [
            "Có thể tránh được nguy hiểm tiềm ẩn",
            "Tạo ấn tượng tốt với người lạ"
          ],
          "longTerm": [
            "Phát triển kỹ năng đánh giá tình huống",
            "Xây dựng danh tiếng thận trọng"
          ],
          "worldImpact": [
            "Không có tác động lớn đến thế giới"
          ],
          "relationshipChanges": [
            "Mysterious Stranger: +5 (tôn trọng sự thận trọng)"
          ]
        },
        "metadata": {
          "difficulty": "medium",
          "moralAlignment": "neutral",
          "riskLevel": 30,
          "rewardPotential": 60,
          "uniqueness": "common"
        }
      }
    ],
    "stats": {
      "level": 16,
      "experience": 15750,
      "health": 180,
      "mana": 120,
      "strength": 25,
      "dexterity": 22,
      "intelligence": 28,
      "wisdom": 24,
      "charisma": 20
    },
    "inventory": [
      {
        "id": "mysterious_amulet_001",
        "name": "Mysterious Amulet",
        "description": "An ancient amulet that pulses with unknown energy",
        "quantity": 1,
        "type": "accessory",
        "rarity": "rare",
        "value": 500,
        "effects": {
          "magic_resistance": 15,
          "mana_regeneration": 2
        },
        "usable": false,
        "equippable": true,
        "equipped": false,
        "metadata": {
          "discoveryContext": "Found during mysterious encounter",
          "loreSignificance": "high",
          "questRelevance": ["The Ancient Mystery"]
        }
      }
    ],
    "skills": [
      {
        "id": "perception_advanced",
        "name": "Advanced Perception",
        "description": "Enhanced ability to notice hidden details and dangers",
        "level": 3,
        "mastery": "Adept",
        "xp": 750,
        "nextLevelXp": 1000,
        "type": "passive",
        "effects": {
          "detection_range": 25,
          "hidden_object_chance": 0.4
        },
        "metadata": {
          "acquisitionMethod": "experience",
          "rarityTier": "uncommon",
          "synergiesWith": ["Stealth", "Investigation"]
        }
      }
    ],
    "lore": [
      {
        "id": "ancient_civilization_fragment_003",
        "title": "The Forgotten Watchers",
        "content": "Ancient texts speak of mysterious beings who watched over the realm in times long past. They were said to appear only when great change was imminent, offering guidance to those deemed worthy.",
        "type": "general",
        "category": "world",
        "importance": "high",
        "timestamp": "2024-01-01T12:00:00Z",
        "tags": ["ancient", "watchers", "prophecy"],
        "relations": [
          {
            "targetId": "mysterious_stranger_001",
            "targetTitle": "The Mysterious Stranger",
            "relationType": "possible_connection",
            "description": "The stranger's appearance matches descriptions of the Watchers",
            "strength": 75
          }
        ],
        "discoveryContext": "Revealed through careful observation and wisdom",
        "metadata": {
          "plotRelevance": "major",
          "worldBuildingValue": "high",
          "playerDiscovery": true
        }
      }
    ],
    "worldStateChanges": {
      "environment": {
        "weather": "misty",
        "conditions": ["mysterious_presence", "heightened_awareness"],
        "specialEffects": ["ancient_magic_stirring"]
      },
      "society": {
        "tensions": {
          "ancient_vs_modern": 65
        },
        "events": ["mysterious_sightings_increase"]
      },
      "discoveredRegions": ["The Whispering Grove"],
      "activeEvents": [
        {
          "id": "watchers_awakening",
          "name": "The Watchers Stir",
          "description": "Ancient powers begin to manifest across the realm",
          "type": "world_event",
          "startTime": "2024-01-01T12:00:00Z",
          "duration": 7200,
          "affectedRegions": ["The Whispering Grove", "Ancient Ruins"],
          "consequences": ["Increased magical activity", "Strange encounters"]
        }
      ]
    },
    "triggeredEvents": [
      {
        "id": "first_watcher_encounter",
        "name": "First Contact with the Watchers",
        "description": "Your first encounter with one of the legendary Watchers",
        "type": "story_milestone",
        "immediateEffects": [
          "Unlocks new dialogue options",
          "Increases ancient lore knowledge"
        ],
        "longTermEffects": [
          "Opens path to ancient questline",
          "Marks player as 'Chosen' by ancient powers"
        ],
        "relatedNpcs": ["Mysterious Stranger"],
        "relatedLocations": ["The Whispering Grove"],
        "probability": 100,
        "metadata": {
          "significance": "major",
          "repeatability": "unique",
          "branchingFactor": "high"
        }
      }
    ],
    "npcUpdates": [
      {
        "npcId": "mysterious_stranger_001",
        "npcName": "Mysterious Stranger",
        "changes": {
          "relationshipLevel": 5,
          "status": "intrigued",
          "currentActivity": "observing_player",
          "knownToPlayer": true
        },
        "newDialogue": [
          "You show wisdom beyond your years, young one.",
          "The ancient ways are not forgotten by all, it seems.",
          "Perhaps you are the one the prophecies speak of..."
        ],
        "newBehavior": "More willing to share ancient knowledge",
        "locationChange": null,
        "metadata": {
          "importanceLevel": "high",
          "questGiver": true,
          "storyRelevance": "major"
        }
      }
    ],
    "questUpdates": [
      {
        "questId": "the_ancient_mystery",
        "status": "active",
        "progress": 15,
        "newObjectives": [
          "Learn more about the Watchers from the Mysterious Stranger",
          "Investigate the ancient ruins mentioned in the lore"
        ],
        "completedObjectives": [
          "Encounter one of the legendary Watchers"
        ],
        "metadata": {
          "questType": "main",
          "difficulty": "hard",
          "estimatedDuration": "long"
        }
      }
    ],
    "achievements": [
      {
        "id": "first_watcher_contact",
        "name": "Ancient Wisdom",
        "description": "Made contact with one of the legendary Watchers",
        "unlockedAt": "2024-01-01T12:00:00Z",
        "rarity": "rare",
        "hidden": false,
        "icon": "ancient_eye",
        "metadata": {
          "category": "story",
          "points": 100,
          "shareWorthy": true
        }
      }
    ],
    "playerStatusEffects": [
      {
        "name": "Ancient Awareness",
        "description": "Your encounter with the Watcher has heightened your perception of ancient magics",
        "duration": 3600,
        "effects": {
          "ancient_lore_bonus": 25,
          "magical_detection": 15,
          "wisdom_temp_boost": 3
        },
        "metadata": {
          "type": "temporary_buff",
          "source": "story_event",
          "stackable": false
        }
      }
    ]
  },
  "metadata": {
    "generation": {
      "pipelineVersion": "1.0.0",
      "totalProcessingTime": 2847,
      "stagesCompleted": 6,
      "qualityScore": 0.94,
      "confidence": 0.91
    },
    "validation": {
      "typeSafety": true,
      "gameBalance": true,
      "narrativeConsistency": true,
      "performance": true,
      "overallScore": 0.95
    },
    "optimization": {
      "applied": ["narrative_enhancement", "choice_balancing"],
      "memoryUsage": 2.1,
      "processingOptimization": 15
    },
    "deployment": {
      "environment": "production",
      "readyForIntegration": true,
      "rollbackAvailable": true,
      "monitoringEnabled": true
    }
  }
}
\`\`\`

## PRODUCTION CHECKLIST
- ✅ Type Safety: 100% compliant
- ✅ Game Balance: Validated and optimized
- ✅ Narrative Quality: High coherence and engagement
- ✅ Performance: Optimized for production
- ✅ Error Handling: Comprehensive error handling
- ✅ Monitoring: Telemetry and monitoring hooks added
- ✅ Documentation: Complete metadata and documentation
- ✅ Rollback: Rollback data prepared

**Status**: READY FOR PRODUCTION DEPLOYMENT 🚀
`;
}

// Helper functions
function determineWorldPhase(gameState: GameState): string {
  const storyLength = gameState.storyHistory.length;
  if (storyLength < 10) return 'beginning';
  if (storyLength < 50) return 'early_middle';
  if (storyLength < 100) return 'late_middle';
  return 'climax';
}

function determineStoryArc(_gameState: GameState): string {
  // Analyze story history to determine current arc
  return 'hero_journey'; // Placeholder
}
