import api from './api';
import {
  CharacterTemplate,
  CharacterCreationSession,
  BackstoryAnalysis,
  PointAllocationSystem,
  CharacterCreationResult,
  SelectTemplateDto,
  AnalyzeBackstoryDto,
  AllocateStatsDto,
  FinalizeCharacterDto,
  CreateCustomTemplateDto,
  GetTemplatesDto,
  ValidationResult,
  StatsValidationResult,
} from '../types/character-creation.types';

class CharacterCreationService {
  private readonly baseUrl = '/games/character-creation';

  /**
   * Get available character templates
   */
  async getTemplates(
    filters: GetTemplatesDto = {},
  ): Promise<CharacterTemplate[]> {
    const params = new URLSearchParams();

    if (filters.worldType) {
      params.append('worldType', filters.worldType);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.includeCustom !== undefined) {
      params.append('includeCustom', filters.includeCustom.toString());
    }

    const response = await api.get<CharacterTemplate[]>(
      `${this.baseUrl}/templates${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return response.data;
  }

  /**
   * Get specific template details
   */
  async getTemplateDetails(
    templateId: string,
    worldType?: string,
  ): Promise<CharacterTemplate> {
    const params = new URLSearchParams();
    if (worldType) {
      params.append('worldType', worldType);
    }

    const response = await api.get<CharacterTemplate>(
      `${this.baseUrl}/templates/${templateId}${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return response.data;
  }

  /**
   * Select a character template
   */
  async selectTemplate(
    selectDto: SelectTemplateDto,
  ): Promise<CharacterCreationSession> {
    const response = await api.post<CharacterCreationSession>(
      `${this.baseUrl}/select-template`,
      selectDto,
    );

    return response.data;
  }

  /**
   * Analyze backstory and get AI suggestions
   */
  async analyzeBackstory(
    analyzeDto: AnalyzeBackstoryDto,
  ): Promise<BackstoryAnalysis> {
    const response = await api.post<BackstoryAnalysis>(
      `${this.baseUrl}/analyze-backstory`,
      analyzeDto,
    );

    return response.data;
  }

  /**
   * Allocate character stats
   */
  async allocateStats(
    allocateDto: AllocateStatsDto,
  ): Promise<CharacterCreationSession> {
    const response = await api.post<CharacterCreationSession>(
      `${this.baseUrl}/allocate-stats`,
      allocateDto,
    );

    return response.data;
  }

  /**
   * Finalize character creation
   */
  async finalizeCharacter(
    finalizeDto: FinalizeCharacterDto,
  ): Promise<CharacterCreationResult> {
    const response = await api.post<CharacterCreationResult>(
      `${this.baseUrl}/finalize`,
      finalizeDto,
    );

    return response.data;
  }

  /**
   * Create custom template
   */
  async createCustomTemplate(
    createDto: CreateCustomTemplateDto,
  ): Promise<CharacterTemplate> {
    const response = await api.post<CharacterTemplate>(
      `${this.baseUrl}/custom-template`,
      createDto,
    );

    return response.data;
  }

  /**
   * Get character creation session
   */
  async getCharacterCreationSession(
    gameId: string,
  ): Promise<CharacterCreationSession> {
    const response = await api.get<CharacterCreationSession>(
      `${this.baseUrl}/session/${gameId}`,
    );

    return response.data;
  }

  /**
   * Get point allocation rules for a world type
   */
  async getPointAllocationRules(
    worldType: string,
  ): Promise<PointAllocationSystem> {
    const response = await api.get<PointAllocationSystem>(
      `${this.baseUrl}/point-allocation/${worldType}`,
    );

    return response.data;
  }

  /**
   * Validate character stats allocation
   */
  async validateStats(
    stats: Record<string, number>,
    worldType: string,
  ): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>(
      `${this.baseUrl}/validate-stats`,
      { stats, worldType },
    );

    return response.data;
  }

  // Helper methods for frontend logic

  /**
   * Calculate point cost for a stat based on scaling rules
   */
  calculateStatCost(
    statName: string,
    targetValue: number,
    currentValue: number,
    rules: PointAllocationSystem,
  ): number {
    const rule = rules.rules.find((r) => r.statName === statName);
    if (!rule) return targetValue - currentValue;

    let cost = 0;
    for (let i = currentValue; i < targetValue; i++) {
      const scaledCost = Math.ceil(
        rule.baseCost * Math.pow(rule.scalingFactor, Math.max(0, i - 10)),
      );
      cost += scaledCost;
    }

    return cost;
  }

  /**
   * Get total points used for current stats allocation
   */
  getTotalPointsUsed(
    stats: Record<string, number>,
    rules: PointAllocationSystem,
  ): number {
    return Object.entries(stats).reduce((total, [statName, value]) => {
      let rule = rules.rules.find((r) => r.statName === statName);

      // If the stat is not found in the rules, create a default rule
      if (!rule) {
        console.warn(
          `Stat not found in rules: ${statName}. Using default values.`,
        );

        // Create a default rule for this stat
        rule = {
          statName: statName,
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'custom',
        };

        // Add the rule to the rules array for future use
        rules.rules.push(rule);
      }

      const baseCost = this.calculateStatCost(
        statName,
        value,
        rule.minValue,
        rules,
      );
      return total + baseCost;
    }, 0);
  }

  /**
   * Check if stats allocation is valid
   */
  validateStatsAllocation(
    stats: Record<string, number>,
    rules: PointAllocationSystem,
  ): StatsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const individualStatErrors: Record<string, string[]> = {};

    let totalPointsUsed = 0;

    Object.entries(stats).forEach(([statName, value]) => {
      let rule = rules.rules.find((r) => r.statName === statName);

      // If the stat is not found in the rules, create a default rule
      if (!rule) {
        console.warn(
          `Stat not found in rules: ${statName}. Using default values.`,
        );

        // Create a default rule for this stat
        rule = {
          statName: statName,
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'custom',
        };

        // Add the rule to the rules array for future use
        rules.rules.push(rule);
      }

      const statErrors: string[] = [];

      if (value < rule.minValue) {
        statErrors.push(`${statName} cannot be less than ${rule.minValue}`);
      }
      if (value > rule.maxValue) {
        statErrors.push(`${statName} cannot be greater than ${rule.maxValue}`);
      }

      if (statErrors.length > 0) {
        individualStatErrors[statName] = statErrors;
      }

      totalPointsUsed += this.calculateStatCost(
        statName,
        value,
        rule.minValue,
        rules,
      );
    });

    const maxPointsAllowed = rules.totalPoints + rules.bonusPoints;
    if (totalPointsUsed > maxPointsAllowed) {
      errors.push(
        `Total points used (${totalPointsUsed}) exceeds maximum allowed (${maxPointsAllowed})`,
      );
    }

    if (totalPointsUsed < rules.totalPoints * 0.8) {
      warnings.push(
        'You have many unused points. Consider allocating them to improve your character.',
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      totalPointsUsed,
      maxPointsAllowed,
      individualStatErrors,
    };
  }

  /**
   * Get recommended stats distribution for a character archetype
   */
  getRecommendedStatsForArchetype(archetype: string): Record<string, number> {
    const baseStats = {
      'Sức Mạnh': 10,
      'Trí Tuệ': 10,
      'Khéo Léo': 10,
      'Thể Lực': 10,
      'Tinh Thần': 10,
      'Uy Tín': 10,
      'Luyện Đan': 10,
      'Thảo Dược': 10,
      'Khôn Ngoan': 10,
      'May Mắn': 10,
      'Sinh Lực': 50,
      Mana: 50,
    };

    switch (archetype.toLowerCase()) {
      case 'warrior':
      case 'chiến binh':
        return {
          ...baseStats,
          'Sức Mạnh': 16,
          'Thể Lực': 14,
          'Uy Tín': 12,
          'Khéo Léo': 11,
          'Trí Tuệ': 9,
          'Tinh Thần': 8,
        };

      case 'mage':
      case 'pháp sư':
        return {
          ...baseStats,
          'Trí Tuệ': 16,
          'Tinh Thần': 14,
          'Khéo Léo': 12,
          'Uy Tín': 11,
          'Thể Lực': 9,
          'Sức Mạnh': 8,
        };

      case 'rogue':
      case 'sát thủ':
        return {
          ...baseStats,
          'Khéo Léo': 16,
          'Trí Tuệ': 14,
          'Tinh Thần': 12,
          'Sức Mạnh': 11,
          'Uy Tín': 9,
          'Thể Lực': 8,
        };

      case 'cleric':
      case 'giáo sĩ':
        return {
          ...baseStats,
          'Tinh Thần': 16,
          'Uy Tín': 14,
          'Trí Tuệ': 12,
          'Thể Lực': 11,
          'Sức Mạnh': 9,
          'Khéo Léo': 8,
        };

      case 'ranger':
      case 'thợ săn':
        return {
          ...baseStats,
          'Khéo Léo': 15,
          'Tinh Thần': 14,
          'Thể Lực': 13,
          'Sức Mạnh': 12,
          'Trí Tuệ': 11,
          'Uy Tín': 10,
        };

      case 'alchemist':
      case 'herbalist':
      case 'luyện đan sư':
      case 'dược sư':
        return {
          ...baseStats,
          'Luyện Đan': 16,
          'Thảo Dược': 16,
          'Trí Tuệ': 14,
          'Khéo Léo': 12,
          'Tinh Thần': 12,
          'Thể Lực': 8,
          'Sức Mạnh': 8,
        };

      default:
        return baseStats;
    }
  }

  /**
   * Get character preview based on current stats
   */
  generateCharacterPreview(
    stats: Record<string, number>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _template?: CharacterTemplate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _backstory?: string,
  ): {
    archetype: string;
    primaryStats: Record<string, number>;
    suggestedPlayStyle: string;
    strengths: string[];
    weaknesses: string[];
  } {
    // Find highest stats
    const sortedStats = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const primaryStats = Object.fromEntries(sortedStats);
    const topStat = sortedStats[0];

    let archetype = 'Balanced';
    let suggestedPlayStyle = 'Versatile approach to challenges';
    let strengths: string[] = [];
    const weaknesses: string[] = [];

    if (topStat[1] >= 15) {
      switch (topStat[0]) {
        case 'Sức Mạnh':
          archetype = 'Warrior';
          suggestedPlayStyle = 'Direct combat and physical challenges';
          strengths = [
            'High damage output',
            'Excellent melee combat',
            'Intimidating presence',
          ];
          break;
        case 'Trí Tuệ':
          archetype = 'Scholar';
          suggestedPlayStyle = 'Problem-solving and magical approaches';
          strengths = ['Spell casting', 'Puzzle solving', 'Knowledge checks'];
          break;
        case 'Khéo Léo':
          archetype = 'Rogue';
          suggestedPlayStyle = 'Stealth and precision strikes';
          strengths = [
            'Stealth operations',
            'Ranged attacks',
            'Trap detection',
          ];
          break;
        case 'Thể Lực':
          archetype = 'Tank';
          suggestedPlayStyle = 'Defensive and endurance-based';
          strengths = [
            'High survivability',
            'Damage resistance',
            'Long-term battles',
          ];
          break;
        case 'Tinh Thần':
          archetype = 'Mystic';
          suggestedPlayStyle = 'Magical support and spiritual guidance';
          strengths = [
            'Magical abilities',
            'Spiritual insight',
            'Mental resistance',
          ];
          break;
        case 'Uy Tín':
          archetype = 'Leader';
          suggestedPlayStyle = 'Social interaction and leadership';
          strengths = ['Persuasion', 'Leadership', 'Social manipulation'];
          break;
        case 'Luyện Đan':
          archetype = 'Alchemist';
          suggestedPlayStyle = 'Crafting potions and magical items';
          strengths = ['Potion brewing', 'Item crafting', 'Resource gathering'];
          break;
        case 'Thảo Dược':
          archetype = 'Herbalist';
          suggestedPlayStyle = 'Healing and support through herbs';
          strengths = [
            'Healing abilities',
            'Plant knowledge',
            'Medicine crafting',
          ];
          break;
        case 'Khôn Ngoan':
          archetype = 'Sage';
          suggestedPlayStyle = 'Wisdom-based decision making';
          strengths = [
            'Insightful observations',
            'Strategic planning',
            'Avoiding traps',
          ];
          break;
        case 'May Mắn':
          archetype = 'Fortune Favored';
          suggestedPlayStyle = 'Taking risks for high rewards';
          strengths = ['Lucky escapes', 'Finding rare items', 'Critical hits'];
          break;
      }
    }

    // Find weaknesses (lowest stats)
    const lowestStats = Object.entries(stats)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2);

    lowestStats.forEach(([stat, value]) => {
      if (value < 10) {
        switch (stat) {
          case 'Sức Mạnh':
            weaknesses.push('Weak physical attacks');
            break;
          case 'Trí Tuệ':
            weaknesses.push('Limited magical abilities');
            break;
          case 'Khéo Léo':
            weaknesses.push('Poor accuracy and stealth');
            break;
          case 'Thể Lực':
            weaknesses.push('Low health and stamina');
            break;
          case 'Tinh Thần':
            weaknesses.push('Vulnerable to mental attacks');
            break;
          case 'Uy Tín':
            weaknesses.push('Poor social interactions');
            break;
          case 'Luyện Đan':
            weaknesses.push('Ineffective potion brewing');
            break;
          case 'Thảo Dược':
            weaknesses.push('Limited herb knowledge');
            break;
          case 'Khôn Ngoan':
            weaknesses.push('Poor decision making');
            break;
          case 'May Mắn':
            weaknesses.push('Frequent bad luck');
            break;
          case 'Sinh Lực':
            weaknesses.push('Easily exhausted');
            break;
          case 'Mana':
            weaknesses.push('Limited magical energy');
            break;
        }
      }
    });

    return {
      archetype,
      primaryStats,
      suggestedPlayStyle,
      strengths,
      weaknesses,
    };
  }
}

export const characterCreationService = new CharacterCreationService();
export default characterCreationService;
