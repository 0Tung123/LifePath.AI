import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIGenerationRequest,
  AIGenerationResponse,
  Tag,
  DynamicType,
  TagCategory,
  TagRarity,
  DynamicTypeCategory,
} from '../../common/types/dynamic-system.types';

@Injectable()
export class AIGenerationService {
  private readonly logger = new Logger(AIGenerationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found. AI generation will be disabled.',
      );
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateDynamicContent(
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    const startTime = Date.now();

    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not configured');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      let prompt: string;

      switch (request.type) {
        case 'tag':
          prompt = this.buildTagGenerationPrompt(request);
          break;
        case 'dynamic_type':
          prompt = this.buildDynamicTypeGenerationPrompt(request);
          break;
        case 'content_enhancement':
          prompt = this.buildContentEnhancementPrompt(request);
          break;
        default:
          throw new Error(`Unsupported generation type: ${request.type}`);
      }

      this.logger.log(
        `Generating ${request.type} with prompt length: ${prompt.length}`,
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      const parsedData = this.parseAIResponse(text, request.type);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: parsedData,
        metadata: {
          processingTime,
          tokensUsed: 0, // Token count not available in current API
          confidence: this.calculateConfidence(response),
          warnings: this.validateGeneratedContent(parsedData),
        },
      };
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`, error.stack);

      return {
        success: false,
        data: [],
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0,
        },
        error: error.message,
      };
    }
  }

  private buildTagGenerationPrompt(request: AIGenerationRequest): string {
    const { context } = request;

    return `
You are an expert game designer creating dynamic tags for a text-based RPG system.

CONTEXT:
- Game ID: ${context.gameId}
- Current Scene: ${context.currentScene || 'Unknown'}
- Player Level: ${context.playerLevel || 'Unknown'}
- Story Context: ${context.storyContext || 'General gameplay'}

REQUIREMENTS:
- Generate ${request.count || 1} unique tags
- Categories needed: ${context.requiredCategories?.join(', ') || 'Any'}
- Power level range: ${context.powerLevelRange?.join('-') || '1-100'}
- Rarity constraints: ${context.rarityConstraints?.join(', ') || 'Any'}

EXISTING TAGS TO AVOID DUPLICATES:
${context.existingTags?.join(', ') || 'None'}

CUSTOM PROMPT:
${context.customPrompt || 'Create interesting and balanced tags that fit the game world.'}

OUTPUT FORMAT (JSON):
{
  "tags": [
    {
      "name": "Tag Name",
      "category": "element|race|class|skill_type|etc",
      "description": "Detailed description of what this tag represents",
      "properties": {
        "stat_name": numeric_value,
        "another_stat": numeric_value
      },
      "rarity": "common|uncommon|rare|epic|legendary|mythical|divine|unique",
      "conflicts": ["conflicting_tag_names"],
      "synergies": [
        {
          "requiredTags": ["tag1", "tag2"],
          "effect": {
            "type": "stat_bonus|new_ability|transformation|special_event",
            "name": "Synergy Name",
            "description": "What happens when combined",
            "effects": {
              "stat_name": multiplier_or_bonus
            }
          }
        }
      ]
    }
  ]
}

Make sure each tag is:
1. Unique and creative
2. Balanced for gameplay
3. Fits the story context
4. Has meaningful properties
5. Includes potential synergies with other tags
`;
  }

  private buildDynamicTypeGenerationPrompt(
    request: AIGenerationRequest,
  ): string {
    const { context } = request;

    return `
You are an expert game designer creating dynamic content for a text-based RPG.

CONTEXT:
- Game ID: ${context.gameId}
- Current Scene: ${context.currentScene || 'Unknown'}
- Player Level: ${context.playerLevel || 'Unknown'}
- Story Context: ${context.storyContext || 'General gameplay'}

REQUIREMENTS:
- Generate ${request.count || 1} unique dynamic types
- Categories: ${context.requiredCategories?.join(', ') || 'Any'}
- Power level range: ${context.powerLevelRange?.join('-') || '1-100'}
- Rarity constraints: ${context.rarityConstraints?.join(', ') || 'Any'}

AVAILABLE TAGS:
${context.existingTags?.join(', ') || 'Create appropriate tags as needed'}

CUSTOM PROMPT:
${context.customPrompt || 'Create interesting and balanced content that enhances the player experience.'}

OUTPUT FORMAT (JSON):
{
  "dynamicTypes": [
    {
      "name": "Item/Character/Skill Name",
      "description": "Rich, detailed description that brings this to life",
      "category": "character|npc|skill|talent|equipment|item|status|quest|event|location",
      "tags": ["tag1", "tag2", "tag3"],
      "baseProperties": {
        "primary_stat": numeric_value,
        "secondary_stat": numeric_value,
        "special_properties": "text_or_numeric"
      },
      "rarity": "common|uncommon|rare|epic|legendary|mythical|divine|unique",
      "powerLevel": numeric_value_1_to_100
    }
  ]
}

Make sure each dynamic type:
1. Has a compelling name and description
2. Uses appropriate tags that make sense together
3. Has balanced properties for its power level
4. Fits the current story context
5. Would be interesting for players to encounter
`;
  }

  private buildContentEnhancementPrompt(request: AIGenerationRequest): string {
    return `
You are enhancing existing game content to make it more dynamic and interesting.

CONTEXT:
${JSON.stringify(request.context, null, 2)}

TASK:
Enhance the provided content by:
1. Adding more descriptive details
2. Suggesting additional properties
3. Creating potential interactions
4. Improving balance

OUTPUT FORMAT (JSON):
{
  "enhancements": [
    {
      "type": "description|properties|interactions|balance",
      "suggestion": "Detailed enhancement suggestion",
      "reasoning": "Why this enhancement improves the content"
    }
  ]
}
`;
  }

  private parseAIResponse(text: string, type: string): (Tag | DynamicType)[] {
    try {
      // Clean up the response text
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);

      if (type === 'tag' && parsed.tags) {
        return parsed.tags.map((tagData: any) => this.createTagFromAI(tagData));
      } else if (type === 'dynamic_type' && parsed.dynamicTypes) {
        return parsed.dynamicTypes.map((typeData: any) =>
          this.createDynamicTypeFromAI(typeData),
        );
      }

      return [];
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      this.logger.debug(`Raw response: ${text}`);
      return [];
    }
  }

  private createTagFromAI(data: any): Tag {
    return {
      name: data.name,
      category: this.validateTagCategory(data.category),
      description: data.description,
      properties: data.properties || {},
      rarity: this.validateTagRarity(data.rarity),
      conflicts: data.conflicts || [],
      synergies: data.synergies || [],
      createdBy: {
        type: 'ai',
        aiModel: 'gemini-pro',
        context: 'AI generated content',
      },
      isActive: true,
    };
  }

  private createDynamicTypeFromAI(data: any): DynamicType {
    return {
      name: data.name,
      description: data.description,
      category: this.validateDynamicTypeCategory(data.category),
      tags: data.tags || [],
      baseProperties: data.baseProperties || {},
      rarity: this.validateTagRarity(data.rarity),
      powerLevel: Math.max(1, Math.min(100, data.powerLevel || 50)),
      createdBy: {
        type: 'ai',
        aiModel: 'gemini-pro',
        context: 'AI generated content',
      },
      isTemplate: false,
    };
  }

  private validateTagCategory(category: string): TagCategory {
    const validCategories = Object.values(TagCategory);
    return validCategories.includes(category as TagCategory)
      ? (category as TagCategory)
      : TagCategory.CUSTOM;
  }

  private validateDynamicTypeCategory(category: string): DynamicTypeCategory {
    const validCategories = Object.values(DynamicTypeCategory);
    return validCategories.includes(category as DynamicTypeCategory)
      ? (category as DynamicTypeCategory)
      : DynamicTypeCategory.ITEM;
  }

  private validateTagRarity(rarity: string): TagRarity {
    const validRarities = Object.values(TagRarity);
    return validRarities.includes(rarity as TagRarity)
      ? (rarity as TagRarity)
      : TagRarity.COMMON;
  }

  private calculateConfidence(response: any): number {
    // Simple confidence calculation based on response quality
    // In a real implementation, this would be more sophisticated

    if (!response.candidates || response.candidates.length === 0) {
      return 0;
    }

    const candidate = response.candidates[0];

    // Check for safety ratings and finish reason
    if (candidate.finishReason === 'STOP') {
      return 0.8; // High confidence for complete responses
    } else if (candidate.finishReason === 'MAX_TOKENS') {
      return 0.6; // Medium confidence for truncated responses
    } else {
      return 0.3; // Low confidence for other cases
    }
  }

  private validateGeneratedContent(data: (Tag | DynamicType)[]): string[] {
    const warnings: string[] = [];

    for (const item of data) {
      // Check for missing required fields
      if (!item.name || item.name.length < 2) {
        warnings.push(`Generated item has invalid name: "${item.name}"`);
      }

      if (!item.description || item.description.length < 10) {
        warnings.push(
          `Generated item "${item.name}" has insufficient description`,
        );
      }

      // Type-specific validations
      if ('tags' in item) {
        // DynamicType validations
        if (!item.tags || item.tags.length === 0) {
          warnings.push(`Dynamic type "${item.name}" has no tags`);
        }

        if (item.powerLevel < 1 || item.powerLevel > 100) {
          warnings.push(
            `Dynamic type "${item.name}" has invalid power level: ${item.powerLevel}`,
          );
        }
      } else {
        // Tag validations
        const tag = item;
        if (tag.conflicts && tag.conflicts.includes(tag.name)) {
          warnings.push(`Tag "${tag.name}" conflicts with itself`);
        }
      }
    }

    return warnings;
  }

  // Utility method to generate tags on demand
  async generateTagsForContext(
    gameId: string,
    storyContext: string,
    requiredCategories: TagCategory[],
    count: number = 3,
  ): Promise<Tag[]> {
    const request: AIGenerationRequest = {
      type: 'tag',
      context: {
        gameId,
        storyContext,
        requiredCategories,
      },
      count,
    };

    const response = await this.generateDynamicContent(request);
    return response.success ? (response.data as Tag[]) : [];
  }

  // Utility method to generate dynamic types on demand
  async generateDynamicTypesForContext(
    gameId: string,
    category: DynamicTypeCategory,
    storyContext: string,
    powerLevelRange: [number, number] = [1, 100],
    count: number = 1,
  ): Promise<DynamicType[]> {
    const request: AIGenerationRequest = {
      type: 'dynamic_type',
      context: {
        gameId,
        storyContext,
        requiredCategories: [category as any], // Dynamic type category used for generation context
        powerLevelRange,
      },
      count,
    };

    const response = await this.generateDynamicContent(request);
    return response.success ? (response.data as DynamicType[]) : [];
  }
}
