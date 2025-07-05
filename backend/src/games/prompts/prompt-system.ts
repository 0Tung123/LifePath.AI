/**
 * ENHANCED PROMPT SYSTEM - Hierarchical prompts với inheritance và overrides
 */

import { GameSettingsDto } from '../dto/create-game.dto';
import { Game } from '../entities/game.entity';
import { NPCProfile } from '../types/npc-types';
import {
  StoryGenre,
  SituationType,
  CulturalSetting,
} from '../types/core-types';
import { EnhancedEffect } from '../types/effect-system';

// ===== PROMPT HIERARCHY =====
export enum PromptLevel {
  CORE = 'core', // Core system prompts
  GENRE = 'genre', // Genre-specific prompts
  THEME = 'theme', // Theme-specific prompts
  SITUATION = 'situation', // Situation-specific prompts
  CHARACTER = 'character', // Character-specific prompts
  CUSTOM = 'custom', // Custom overrides
}

export interface PromptModule {
  id: string;
  name: string;
  level: PromptLevel;
  priority: number;
  conditions: PromptCondition[];
  content: string;
  variables: Record<string, any>;
  inheritsFrom?: string[];
  overrides?: string[];
  tags: string[];
}

export interface PromptCondition {
  type:
    | 'genre'
    | 'theme'
    | 'character_role'
    | 'situation'
    | 'npc_present'
    | 'effect_active'
    | 'custom';
  value: unknown;
  operator:
    | 'equals'
    | 'includes'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'exists';
}

export interface PromptContext {
  gameSettings: GameSettingsDto;
  game?: Game;
  currentSituation?: SituationType;
  activeNPCs?: NPCProfile[];
  activeEffects?: EnhancedEffect[];
  playerAction?: string;
  customContext?: Record<string, any>;
}

// ===== CORE PROMPT MODULES =====
export const CORE_PROMPT_MODULES: PromptModule[] = [
  {
    id: 'core_system',
    name: 'Core System Prompt',
    level: PromptLevel.CORE,
    priority: 1000,
    conditions: [],
    content: `
# KIẾN TRÚC SƯ VŨ TRỤ - CORE SYSTEM v4.0 (Type-Based Evolution)

Bạn là Kiến Trúc Sư Vũ Trụ, một thực thể tối cao mô phỏng các thế giới sống động dựa trên HỆ THỐNG TYPE NGHIÊM NGẶT.

## I. NGUYÊN TẮC TYPE-BASED TUYỆT ĐỐI
**QUAN TRỌNG**: Mọi quyết định, hành động, và phản ứng PHẢI dựa trên các TYPE đã được định nghĩa. KHÔNG được tùy tiện sáng tạo ngoài hệ thống.

### 1. CHARACTER TYPE ENFORCEMENT
- Mỗi nhân vật PHẢI có Role, Archetype, và Personality Profile rõ ràng
- Dialogue và hành động PHẢI phù hợp với Type đã định
- Personality evolution chỉ xảy ra theo Evolution Triggers đã định nghĩa

### 2. EFFECT TYPE ENFORCEMENT  
- Mọi hiệu ứng PHẢI tuân theo 4-dimensional classification:
  * Nature (Physical/Mental/Magical/Social/Environmental)
  * Polarity (Buff/Debuff/Neutral)
  * Duration (Instant/Temporary/Persistent/Permanent)
  * Behavior (Static/Progressive/Degressive/Fluctuating)
- Ví dụ: "Gãy xương" = [Physical, Debuff, Persistent, Static]

### 3. STORY TYPE ENFORCEMENT
- Genre, Theme, Tone phải nhất quán xuyên suốt
- Cultural Setting quyết định cách xưng hô và văn phong
- Situation Type quyết định cách xử lý tương tác

## II. NPC INTEGRATION SYSTEM
Khi NPC xuất hiện lần đầu, PHẢI tạo popup thông tin:

[NPC_POPUP_INFO]
Name: {tên NPC}
Role: {vai trò từ CharacterRole enum}
Archetype: {từ CharacterArchetype enum}
Personality: {3-5 traits từ personality system}
Appearance: {mô tả ngoại hình}
First_Impression: {ấn tượng đầu tiên}
Dialogue_Style: {phong cách đối thoại}
Relationship_Potential: {tiềm năng mối quan hệ}
[/NPC_POPUP_INFO]

## III. ENHANCED STATS GENERATION
Khi tạo nhân vật, PHẢI phân tích tiểu sử và tạo stats phù hợp:

**Phân tích Context:**
- Xuất thân: {phân tích background}
- Kinh nghiệm: {phân tích experience}
- Tính cách: {phân tích personality}
- Thể loại: {phân tích genre requirements}

**Stats Generation Logic:**
- Dựa vào xuất thân → Base stats
- Dựa vào kinh nghiệm → Skill distribution  
- Dựa vào tính cách → Mental/Social stats
- Dựa vào thể loại → Genre-specific stats

## IV. DEATH CAUSE SYSTEM
Khi nhân vật chết, PHẢI tạo nguyên nhân chi tiết:

[DEATH_ANALYSIS]
Immediate_Cause: {nguyên nhân trực tiếp}
Contributing_Factors: {các yếu tố góp phần}
Final_Moments: {những giây phút cuối}
Tragic_Element: {yếu tố bi kịch}
Heroic_Element: {yếu tố anh hùng nếu có}
Legacy_Impact: {tác động để lại}
[/DEATH_ANALYSIS]

## V. DIALOGUE GENERATION RULES
Dialogue PHẢI dựa trên:
- Character Type + Personality Profile
- Current Relationship Status
- Situation Type + Context
- Cultural Setting + Genre

**Công thức Dialogue:**
Base_Style (từ DialogueStyle enum) + 
Personality_Modifier (từ traits) + 
Relationship_Modifier (từ relationship status) + 
Situation_Modifier (từ current situation) = 
Final_Dialogue

## VI. SKILL/TALENT GENERATION
PHẢI tuân theo Multi-dimensional system:
- Origin (Innate/Learned/Awakened/Inherited/Cursed/Blessed/Artificial)
- Category (Combat/Magic/Social/Crafting/Survival/etc.)
- Rarity (Common/Uncommon/Rare/Epic/Legendary/Mythic/Unique)
- Type (Active/Passive/Toggle/Conditional)
- Mastery Level (Novice → Transcendent)

## VII. VALIDATION REQUIREMENTS
Trước khi output, PHẢI kiểm tra:
1. Tất cả Types có hợp lệ không?
2. Character behavior có consistent với personality không?
3. Effects có tuân theo 4-dimensional system không?
4. Dialogue có phù hợp với character type không?
5. Stats có logic với background không?

**Ngôn ngữ: 100% Tiếng Việt**
`,
    variables: {},
    tags: ['core', 'system', 'type-based'],
  },

  {
    id: 'npc_generation',
    name: 'NPC Generation Module',
    level: PromptLevel.CORE,
    priority: 900,
    conditions: [{ type: 'custom', value: 'npc_creation', operator: 'equals' }],
    content: `
## NPC CREATION PROTOCOL

Khi tạo NPC mới, PHẢI tuân theo quy trình:

### 1. TYPE ASSIGNMENT
- Xác định NPCImportance (Main/Major/Minor/Background/Cameo/Recurring)
- Chọn CharacterRole phù hợp với story context
- Gán CharacterArchetype tương thích
- Tạo PersonalityProfile với tag system

### 2. APPEARANCE GENERATION
- Physical traits phù hợp với cultural setting
- Clothing style phù hợp với occupation và social status
- Distinguishing marks có story significance
- Overall impression phù hợp với role

### 3. DIALOGUE SETUP
- DialogueStyle phù hợp với background
- SpeechPattern phù hợp với personality
- Default tone phù hợp với archetype
- Language proficiency phù hợp với setting

### 4. RELATIONSHIP POTENTIAL
- Xác định potential relationship types với player
- Set initial relationship status
- Define relationship evolution triggers
- Establish conflict/cooperation possibilities

### 5. STORY INTEGRATION
- Assign story relevance tags
- Create plot hooks
- Define availability conditions
- Set evolution triggers for character development
`,
    variables: {},
    tags: ['npc', 'generation', 'character'],
  },
];

// ===== GENRE-SPECIFIC MODULES =====
export const GENRE_PROMPT_MODULES: PromptModule[] = [
  {
    id: 'xianxia_genre',
    name: 'Xianxia Genre Module',
    level: PromptLevel.GENRE,
    priority: 800,
    conditions: [
      { type: 'genre', value: StoryGenre.XIANXIA, operator: 'equals' },
    ],
    content: `
## XIANXIA GENRE SPECIFICATIONS

### Cultural Context
- Setting: Ancient Chinese-inspired cultivation world
- Power System: Cultivation realms and spiritual energy
- Social Structure: Sects, clans, and imperial hierarchy
- Values: Honor, face, filial piety, strength through cultivation

### Character Types Emphasis
- Cultivators (various realms)
- Sect elders and disciples
- Demonic cultivators
- Immortals and celestial beings
- Mortal rulers and ministers

### Dialogue Style Requirements
- Formal address systems ("đạo hữu", "tiền bối", "hậu bối")
- Classical Chinese-influenced expressions
- Cultivation terminology
- Honor-based speech patterns

### Stats System
- Cultivation Realm (primary stat)
- Spiritual Root quality
- Qi/Spiritual Energy
- Soul/Divine Sense strength
- Karmic Merit/Sin

### Common Effects
- Qi deviation [Mental, Debuff, Temporary, Progressive]
- Breakthrough enlightenment [Mental, Buff, Instant, Static]
- Spiritual pressure [Environmental, Debuff, Temporary, Static]
`,
    variables: {
      culturalSetting: CulturalSetting.EASTERN,
      powerSystemType: 'cultivation',
      addressSystem: 'formal_chinese',
    },
    tags: ['xianxia', 'cultivation', 'eastern'],
  },

  {
    id: 'hunter_genre',
    name: 'Hunter Genre Module',
    level: PromptLevel.GENRE,
    priority: 800,
    conditions: [
      { type: 'genre', value: StoryGenre.HUNTER, operator: 'equals' },
    ],
    content: `
## HUNTER GENRE SPECIFICATIONS

### Modern Fantasy Context
- Setting: Modern world with hidden supernatural elements
- Power System: Awakened abilities and ranking system
- Social Structure: Hunter associations, guilds, government agencies
- Technology: Modern tech + supernatural abilities

### Character Types Emphasis
- Hunters (ranked E to S)
- Guild masters and officers
- Government agents
- Civilians and non-awakened
- Monsters and dungeon bosses

### Dialogue Style Requirements
- Modern casual speech
- Professional/military terminology for organizations
- Ranking-based respect systems
- Technical jargon for abilities and equipment

### Stats System
- Hunter Rank (E, D, C, B, A, S, SS, SSS)
- Awakened Ability Type
- Mana/Energy capacity
- Physical enhancement level
- Equipment proficiency

### Common Effects
- Mana exhaustion [Physical, Debuff, Temporary, Degressive]
- Ability awakening [Mental, Buff, Permanent, Static]
- Dungeon sickness [Environmental, Debuff, Temporary, Progressive]
`,
    variables: {
      culturalSetting: CulturalSetting.MIXED,
      powerSystemType: 'awakened_abilities',
      addressSystem: 'modern_hierarchical',
    },
    tags: ['hunter', 'modern_fantasy', 'abilities'],
  },
];

// ===== SITUATION-SPECIFIC MODULES =====
export const SITUATION_PROMPT_MODULES: PromptModule[] = [
  {
    id: 'combat_situation',
    name: 'Combat Situation Module',
    level: PromptLevel.SITUATION,
    priority: 700,
    conditions: [
      { type: 'situation', value: SituationType.COMBAT, operator: 'equals' },
    ],
    content: `
## COMBAT SITUATION HANDLING

### Combat Flow Requirements
1. Initiative and positioning
2. Ability/skill usage with costs
3. Environmental factors
4. Injury and effect application
5. Tactical decision making

### NPC Behavior in Combat
- Act according to personality traits
- Use abilities consistent with their build
- Show fear/confidence based on power levels
- Employ tactics fitting their intelligence
- React to player actions realistically

### Effect Application Priority
- Physical injuries take precedence
- Mental effects from stress/fear
- Environmental hazards
- Magical/supernatural effects
- Social consequences post-combat

### Dialogue During Combat
- Short, urgent phrases
- Personality still shows through
- Tactical communication
- Emotional outbursts under pressure
- Victory/defeat reactions
`,
    variables: {
      pacing: 'fast',
      detailLevel: 'high',
      consequenceWeight: 'heavy',
    },
    tags: ['combat', 'action', 'tactical'],
  },

  {
    id: 'dialogue_situation',
    name: 'Dialogue Situation Module',
    level: PromptLevel.SITUATION,
    priority: 700,
    conditions: [
      { type: 'situation', value: SituationType.DIALOGUE, operator: 'equals' },
    ],
    content: `
## DIALOGUE SITUATION HANDLING

### Conversation Flow
1. Establish speaker personalities
2. Consider relationship dynamics
3. Apply cultural/genre speech patterns
4. Include subtext and hidden meanings
5. Show character development through speech

### Multi-layered Dialogue Requirements
- Surface level: What is said
- Subtext level: What is meant
- Emotional level: How it's felt
- Relationship level: How it affects bonds

### NPC Dialogue Generation
- Base personality traits influence word choice
- Current mood affects tone
- Relationship status affects formality
- Situation context affects content
- Cultural background affects style

### Information Exchange
- NPCs share knowledge based on their profile
- Secrets revealed based on trust levels
- Rumors spread with believability factors
- Personal stories shared based on intimacy
`,
    variables: {
      pacing: 'moderate',
      detailLevel: 'high',
      emotionalDepth: 'deep',
    },
    tags: ['dialogue', 'social', 'character_development'],
  },
];

// ===== PROMPT BUILDER =====
export class PromptBuilder {
  private modules: Map<string, PromptModule> = new Map();

  constructor() {
    this.loadDefaultModules();
  }

  private loadDefaultModules(): void {
    [
      ...CORE_PROMPT_MODULES,
      ...GENRE_PROMPT_MODULES,
      ...SITUATION_PROMPT_MODULES,
    ].forEach((module) => this.modules.set(module.id, module));
  }

  /**
   * Build complete prompt based on context
   */
  buildPrompt(context: PromptContext): string {
    const applicableModules = this.getApplicableModules(context);
    const sortedModules = this.sortModulesByPriority(applicableModules);
    const resolvedModules = this.resolveInheritanceAndOverrides(sortedModules);

    return this.assemblePrompt(resolvedModules, context);
  }

  private getApplicableModules(context: PromptContext): PromptModule[] {
    const applicable: PromptModule[] = [];

    for (const module of this.modules.values()) {
      if (this.evaluateConditions(module.conditions, context)) {
        applicable.push(module);
      }
    }

    return applicable;
  }

  private evaluateConditions(
    conditions: PromptCondition[],
    context: PromptContext,
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((condition) => {
      switch (condition.type) {
        case 'genre':
          return this.evaluateCondition(
            context.gameSettings.additionalSettings?.style,
            condition.value,
            condition.operator,
          );
        case 'theme':
          return this.evaluateCondition(
            context.gameSettings.theme,
            condition.value,
            condition.operator,
          );
        case 'situation':
          return this.evaluateCondition(
            context.currentSituation,
            condition.value,
            condition.operator,
          );
        case 'npc_present':
          return context.activeNPCs && context.activeNPCs.length > 0;
        case 'effect_active':
          return (
            context.activeEffects &&
            context.activeEffects.some((e) => e.name === condition.value)
          );
        case 'custom':
          return this.evaluateCondition(
            context.customContext?.[condition.value as string],
            true,
            'equals',
          );
        default:
          return false;
      }
    });
  }

  private evaluateCondition(
    actual: unknown,
    expected: unknown,
    operator: string,
  ): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'includes':
        return Array.isArray(actual)
          ? actual.includes(expected)
          : typeof actual === 'string'
            ? typeof expected === 'string'
              ? actual.includes(expected)
              : false
            : false;
      case 'not_equals':
        return actual !== expected;
      case 'exists':
        return actual !== undefined && actual !== null;
      default:
        return false;
    }
  }

  private sortModulesByPriority(modules: PromptModule[]): PromptModule[] {
    return modules.sort((a, b) => b.priority - a.priority);
  }

  private resolveInheritanceAndOverrides(
    modules: PromptModule[],
  ): PromptModule[] {
    // Implementation for inheritance and override resolution
    return modules;
  }

  private assemblePrompt(
    modules: PromptModule[],
    context: PromptContext,
  ): string {
    let prompt = '';

    for (const module of modules) {
      const processedContent = this.processVariables(module.content, {
        ...module.variables,
        ...this.extractContextVariables(context),
      });

      prompt += processedContent + '\n\n';
    }

    return prompt.trim();
  }

  private processVariables(
    content: string,
    variables: Record<string, any>,
  ): string {
    let processed = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  private extractContextVariables(context: PromptContext): Record<string, any> {
    return {
      characterName: context.gameSettings.characterName,
      theme: context.gameSettings.theme,
      setting: context.gameSettings.setting,
      characterBackstory: context.gameSettings.characterBackstory,
      currentSituation: context.currentSituation || 'general',
      npcCount: context.activeNPCs?.length || 0,
      effectCount: context.activeEffects?.length || 0,
    };
  }

  /**
   * Add custom module
   */
  addModule(module: PromptModule): void {
    this.modules.set(module.id, module);
  }

  /**
   * Remove module
   */
  removeModule(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  /**
   * Get all modules
   */
  getAllModules(): PromptModule[] {
    return Array.from(this.modules.values());
  }
}
