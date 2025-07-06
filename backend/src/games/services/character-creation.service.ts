import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { GeminiService } from '../gemini.service';
import { GameStats } from '../interfaces/game-content.interface';
import {
  CharacterTemplate,
  CharacterCreationSession,
  BackstoryAnalysis,
  PointAllocationSystem,
  CharacterCreationResult,
  EnhancedGameStats,
} from '../interfaces/character-stats.interface';
import {
  SelectTemplateDto,
  AnalyzeBackstoryDto,
  AllocateStatsDto,
  FinalizeCharacterDto,
  GetTemplatesDto,
  BackstoryAnalysisResponseDto,
  CharacterCreationResultDto,
  CreateCustomTemplateDto,
} from '../dto/character-creation.dto';

@Injectable()
export class CharacterCreationService {
  private readonly logger = new Logger(CharacterCreationService.name);

  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    private geminiService: GeminiService,
  ) {}

  /**
   * Get available character templates based on world type and category
   */
  async getTemplates(
    userId: string,
    filters: GetTemplatesDto,
  ): Promise<CharacterTemplate[]> {
    this.logger.log(
      `Getting templates for user ${userId} with filters: ${JSON.stringify(filters)}`,
    );

    // For now, return predefined templates
    // In a real implementation, this would query a database
    const globalTemplates = await this.getGlobalTemplates();
    const settingTemplates = await this.getSettingSpecificTemplates(
      filters.worldType,
    );
    const customTemplates = filters.includeCustom
      ? await this.getCustomTemplates(userId)
      : [];

    let templates = [
      ...globalTemplates,
      ...settingTemplates,
      ...customTemplates,
    ];

    if (filters.category) {
      templates = templates.filter((t) => t.category === filters.category);
    }

    if (filters.worldType) {
      templates = templates.filter(
        (t) =>
          t.category === 'global' ||
          (t.worldTypes &&
            filters.worldType &&
            t.worldTypes.includes(filters.worldType)),
      );
    }

    return templates;
  }

  /**
   * Select a template for character creation
   */
  async selectTemplate(
    userId: string,
    selectTemplateDto: SelectTemplateDto,
  ): Promise<CharacterCreationSession> {
    const { gameId, templateId, useCustomBackstory, customBackstory } =
      selectTemplateDto;

    // Verify game exists and belongs to user
    const game = await this.gamesRepository.findOne({
      where: { id: gameId, userId },
    });

    if (!game) {
      throw new BadRequestException('Game not found or access denied');
    }

    // Get the selected template
    const templates = await this.getTemplates(userId, {});
    const selectedTemplate = templates.find((t) => t.id === templateId);

    if (!selectedTemplate) {
      throw new BadRequestException('Template not found');
    }

    // Create character creation session
    const session: CharacterCreationSession = {
      gameId,
      userId,
      currentStep: 'backstory',
      steps: [
        {
          step: 'template',
          completed: true,
          data: { templateId, selectedTemplate },
        },
        {
          step: 'backstory',
          completed: false,
          data: {
            useCustomBackstory: useCustomBackstory || false,
            customBackstory: customBackstory || selectedTemplate.backstory,
          },
        },
        {
          step: 'stats',
          completed: false,
          data: {},
        },
        {
          step: 'finalize',
          completed: false,
          data: {},
        },
      ],
      selectedTemplate,
      customBackstory: useCustomBackstory ? customBackstory : undefined,
      totalPointsAllocated: 0,
      maxPointsAllowed: 100, // Default point allocation
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would be stored in a database
    // For now, we'll store it in memory or as part of the game entity

    return session;
  }

  /**
   * Analyze backstory and suggest stats
   */
  async analyzeBackstory(
    userId: string,
    analyzeDto: AnalyzeBackstoryDto,
  ): Promise<BackstoryAnalysisResponseDto> {
    const { gameId, backstory, worldType, templateId } = analyzeDto;

    // Verify game exists and belongs to user
    const game = await this.gamesRepository.findOne({
      where: { id: gameId, userId },
    });

    if (!game) {
      throw new BadRequestException('Game not found or access denied');
    }

    // Build prompt for AI analysis
    const analysisPrompt = await this.buildBackstoryAnalysisPrompt(
      backstory,
      worldType || game.settings.theme,
      templateId,
    );

    // Get AI response
    const aiResponse =
      await this.geminiService.generateGameContent(analysisPrompt);

    // Parse AI response into structured data
    const analysis = await this.parseBackstoryAnalysis(aiResponse);

    return {
      characterArchetype: analysis.characterArchetype,
      suggestedStats: analysis.suggestedStats,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence,
      detectedKeywords: analysis.detectedKeywords,
      worldContextAdjustments: analysis.worldContextAdjustments,
    };
  }

  /**
   * Allocate stats points
   */
  async allocateStats(
    userId: string,
    allocateDto: AllocateStatsDto,
  ): Promise<CharacterCreationSession> {
    const { gameId, stats, acceptAiSuggestions, totalPointsUsed } = allocateDto;

    // Verify game exists and belongs to user
    const game = await this.gamesRepository.findOne({
      where: { id: gameId, userId },
    });

    if (!game) {
      throw new BadRequestException('Game not found or access denied');
    }

    // Get point allocation system for this world type
    const pointSystem = await this.getPointAllocationSystem(
      game.settings.theme,
    );

    // Validate point allocation
    const isValid = await this.validatePointAllocation(
      stats,
      pointSystem,
      totalPointsUsed,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid point allocation');
    }

    // Create updated session
    const session: CharacterCreationSession = {
      gameId,
      userId,
      currentStep: 'finalize',
      steps: [
        { step: 'template', completed: true, data: {} },
        { step: 'backstory', completed: true, data: {} },
        { step: 'stats', completed: true, data: { stats, totalPointsUsed } },
        { step: 'finalize', completed: false, data: {} },
      ],
      finalStats: stats,
      totalPointsAllocated: totalPointsUsed,
      maxPointsAllowed: pointSystem.totalPoints + pointSystem.bonusPoints,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return session;
  }

  /**
   * Finalize character creation
   */
  async finalizeCharacter(
    userId: string,
    finalizeDto: FinalizeCharacterDto,
  ): Promise<CharacterCreationResultDto> {
    const { gameId, finalStats, selectedTraits, saveAsTemplate, templateName } =
      finalizeDto;

    // Verify game exists and belongs to user
    const game = await this.gamesRepository.findOne({
      where: { id: gameId, userId },
    });

    if (!game) {
      throw new BadRequestException('Game not found or access denied');
    }

    // Convert stats to enhanced format
    const enhancedStats = await this.convertToEnhancedStats(
      finalStats,
      game.settings.theme,
    );

    // Filter out undefined values to match GameStats interface
    const gameStats: GameStats = Object.fromEntries(
      Object.entries(enhancedStats).filter(([_, value]) => value !== undefined),
    ) as GameStats;

    // Update game with final character stats
    game.characterStats = gameStats;
    await this.gamesRepository.save(game);

    // Save as custom template if requested
    if (saveAsTemplate && templateName) {
      await this.saveAsCustomTemplate(userId, templateName, finalStats, game);
    }

    const result: CharacterCreationResultDto = {
      characterStats: enhancedStats,
      totalPointsUsed: Object.values(finalStats).reduce(
        (sum, value) => sum + value,
        0,
      ),
      creationMethod: 'hybrid',
    };

    return result;
  }

  /**
   * Create custom template
   */
  async createCustomTemplate(
    userId: string,
    createDto: CreateCustomTemplateDto,
  ): Promise<CharacterTemplate> {
    const template: CharacterTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: createDto.name,
      description: createDto.description,
      category: 'custom',
      worldTypes: createDto.worldTypes || [],
      backstory: createDto.backstory,
      attributes: createDto.attributes,
      skills: createDto.skills,
      startingItems: createDto.startingItems,
      traits: createDto.traits,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would be saved to a database
    // For now, we'll return the template
    return template;
  }

  // Private helper methods

  private async getGlobalTemplates(): Promise<CharacterTemplate[]> {
    return [
      {
        id: 'warrior',
        name: 'Chiến Binh',
        description:
          'Một chiến binh dũng mãnh với sức mạnh và thể lực vượt trội',
        category: 'global',
        backstory:
          'Bạn là một chiến binh đã được rèn luyện từ nhỏ, thông thạo các loại vũ khí và có thể lực mạnh mẽ. Bạn luôn đứng đầu trong mọi trận chiến.',
        attributes: {
          'Sức Mạnh': 18,
          'Thể Lực': 16,
          'Khéo Léo': 12,
          'Trí Tuệ': 10,
          'Sức Khỏe': 15,
          'Uy Tín': 12,
        },
        skills: ['Sử dụng vũ khí', 'Chiến thuật', 'Lãnh đạo'],
        startingItems: ['Kiếm sắt', 'Áo giáp da', 'Khiên'],
        traits: ['Dũng Cảm', 'Sức Bền'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mage',
        name: 'Pháp Sư',
        description:
          'Một pháp sư thông thái với khả năng sử dụng phép thuật mạnh mẽ',
        category: 'global',
        backstory:
          'Bạn đã dành cả cuộc đời để nghiên cứu phép thuật và bí thuật. Trí tuệ của bạn vượt trội nhưng thể lực thì yếu đuối.',
        attributes: {
          'Trí Tuệ': 18,
          Mana: 20,
          'Sức Mạnh': 8,
          'Thể Lực': 10,
          'Khéo Léo': 12,
          'Sức Khỏe': 12,
        },
        skills: ['Phép thuật', 'Nghiên cứu', 'Giải mã'],
        startingItems: ['Đũa phép', 'Sách phép thuật', 'Bình thuốc'],
        traits: ['Thông Thái', 'Tập Trung'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rogue',
        name: 'Sát Thủ',
        description:
          'Một sát thủ khéo léo với khả năng ẩn mình và tấn công bất ngờ',
        category: 'global',
        backstory:
          'Bạn là một sát thủ chuyên nghiệp, thông thạo việc di chuyển trong bóng tối và tấn công từ sau lưng. Bạn ưa thích sự tự do và độc lập.',
        attributes: {
          'Khéo Léo': 18,
          'Tốc Độ': 16,
          'Ẩn Mình': 15,
          'Trí Tuệ': 14,
          'Sức Mạnh': 12,
          'Thể Lực': 11,
        },
        skills: ['Ẩn mình', 'Khóa và bẫy', 'Tấn công bất ngờ'],
        startingItems: ['Dao găm', 'Dây thừng', 'Bộ dụng cụ trộm'],
        traits: ['Nhanh Nhạy', 'Lén Lút'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cleric',
        name: 'Giáo Sĩ',
        description: 'Một giáo sĩ tận tâm với khả năng chữa lành và bảo vệ',
        category: 'global',
        backstory:
          'Bạn là một giáo sĩ trung thành, dành cuộc đời để phục vụ thần linh và chữa lành cho mọi người. Lòng từ bi của bạn được nhiều người kính trọng.',
        attributes: {
          'Trí Tuệ': 16,
          'Tinh Thần': 18,
          'Sức Khỏe': 14,
          'Uy Tín': 15,
          'Sức Mạnh': 10,
          'Thể Lực': 12,
        },
        skills: ['Chữa lành', 'Phép thuật thiêng liêng', 'Khuyến khích'],
        startingItems: [
          'Đũa thiêng',
          'Cuốn kinh thánh',
          'Bình thuốc chữa lành',
        ],
        traits: ['Từ Bi', 'Thánh Thiện'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ranger',
        name: 'Thợ Săn',
        description:
          'Một thợ săn thông thạo tự nhiên với khả năng bắn cung và theo dõi',
        category: 'global',
        backstory:
          'Bạn lớn lên trong rừng sâu, am hiểu mọi thứ về tự nhiên. Bạn là một cung thủ tài ba và có thể sinh tồn trong mọi hoàn cảnh.',
        attributes: {
          'Khéo Léo': 16,
          'Tốc Độ': 15,
          'Sinh Tồn': 18,
          'Trí Tuệ': 13,
          'Sức Mạnh': 14,
          'Thể Lực': 14,
        },
        skills: ['Bắn cung', 'Theo dõi', 'Sinh tồn'],
        startingItems: ['Cung gỗ', 'Mũi tên', 'Bẫy săn'],
        traits: ['Nhạy Bén', 'Kiên Nhẫn'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private async getSettingSpecificTemplates(
    worldType?: string,
  ): Promise<CharacterTemplate[]> {
    const templates: CharacterTemplate[] = [];

    if (worldType === 'Fantasy') {
      templates.push(
        {
          id: 'sword_cultivator',
          name: 'Kiếm Tu',
          description: 'Một kiếm tu luyện tập kiếm đạo và nội công',
          category: 'setting_specific',
          worldTypes: ['Fantasy'],
          backstory:
            'Bạn là một kiếm tu trẻ tuổi, đã dành nhiều năm luyện tập kiếm pháp và nội công. Mục tiêu của bạn là đạt được cảnh giới cao nhất trong kiếm đạo.',
          attributes: {
            'Kiếm Pháp': 16,
            'Nội Công': 14,
            'Tốc Độ': 15,
            'Tinh Thần': 13,
            'Sức Mạnh': 14,
            'Thể Lực': 13,
          },
          skills: ['Kiếm pháp', 'Nội công', 'Thiền định'],
          startingItems: ['Kiếm dài', 'Kinh sách võ thuật', 'Đan dược'],
          traits: ['Quyết Tâm', 'Kiếm Tâm'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'alchemy_master',
          name: 'Đan Sư',
          description: 'Một đan sư thông thạo việc luyện đan và thảo dược',
          category: 'setting_specific',
          worldTypes: ['Fantasy'],
          backstory:
            'Bạn là một đan sư tài ba, am hiểu sâu sắc về thảo dược và luyện đan. Bạn có thể tạo ra những viên đan với tác dụng kỳ diệu.',
          attributes: {
            'Luyện Đan': 18,
            'Thảo Dược': 16,
            'Trí Tuệ': 15,
            'Tinh Thần': 14,
            'Sức Mạnh': 9,
            'Thể Lực': 10,
          },
          skills: ['Luyện đan', 'Thảo dược học', 'Nhận biết độc tố'],
          startingItems: ['Lò đan', 'Thảo dược', 'Công thức đan'],
          traits: ['Kiên Nhẫn', 'Tỉ Mỉ'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    }

    if (worldType === 'Sci-Fi') {
      templates.push(
        {
          id: 'space_marine',
          name: 'Chiến Binh Không Gian',
          description:
            'Một chiến binh được cải tạo sinh học cho các trận chiến không gian',
          category: 'setting_specific',
          worldTypes: ['Sci-Fi'],
          backstory:
            'Bạn là một chiến binh không gian tinh nhuệ, được cải tạo sinh học và huấn luyện để chiến đấu trong môi trường không gian khắc nghiệt.',
          attributes: {
            'Sức Mạnh': 17,
            'Thể Lực': 18,
            'Khéo Léo': 14,
            'Công Nghệ': 13,
            'Chiến Thuật': 15,
            'Ý Chí': 14,
          },
          skills: ['Vũ khí năng lượng', 'Chiến thuật', 'Điều khiển phi thuyền'],
          startingItems: [
            'Súng laser',
            'Áo giáp năng lượng',
            'Bộ đồ không gian',
          ],
          traits: ['Bền Bỉ', 'Kỷ Luật'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cyberpunk_hacker',
          name: 'Hacker Cyberpunk',
          description: 'Một hacker chuyên nghiệp trong thế giới cyberpunk',
          category: 'setting_specific',
          worldTypes: ['Sci-Fi'],
          backstory:
            'Bạn là một hacker tài ba trong thế giới cyberpunk, thành thạo việc xâm nhập các hệ thống máy tính và mạng neural.',
          attributes: {
            Hacking: 18,
            'Trí Tuệ': 16,
            'Khéo Léo': 13,
            'Công Nghệ': 17,
            'Tốc Độ': 12,
            'Tinh Thần': 10,
          },
          skills: ['Hacking', 'Lập trình', 'Phá mã'],
          startingItems: ['Laptop siêu việt', 'Chip não', 'Phần mềm virus'],
          traits: ['Tò Mò', 'Thông Minh'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    }

    return templates;
  }

  private async getCustomTemplates(
    userId: string,
  ): Promise<CharacterTemplate[]> {
    // In a real implementation, this would query user's custom templates from database
    return [];
  }

  private async buildBackstoryAnalysisPrompt(
    backstory: string,
    worldType: string,
    templateId?: string,
  ): Promise<string> {
    const { buildBackstoryAnalysisPrompt } = await import(
      '../prompts/character-creation.prompt'
    );
    return buildBackstoryAnalysisPrompt(backstory, worldType, templateId);
  }

  private getWorldSpecificStats(worldType: string): string {
    switch (worldType) {
      case 'Fantasy':
        return '- Mana (magical energy)\n- Nội Công (internal energy)\n- Kiếm Pháp (sword skill)\n- Phép Thuật (magic skill)';
      case 'Sci-Fi':
        return '- Công Nghệ (technology skill)\n- Hacking (computer skills)\n- Cải Tạo Sinh Học (biological enhancement)';
      case 'Post-Apocalyptic':
        return '- Sinh Tồn (survival skills)\n- Bức Xạ (radiation resistance)\n- Sửa Chữa (repair skills)';
      default:
        return '';
    }
  }

  private async parseBackstoryAnalysis(
    aiResponse: string,
  ): Promise<BackstoryAnalysis> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          characterArchetype: parsed.characterArchetype || 'Unknown',
          suggestedStats: parsed.suggestedStats || {},
          reasoning: parsed.reasoning || 'No reasoning provided',
          confidence: parsed.confidence || 0.5,
          detectedKeywords: parsed.detectedKeywords || [],
          worldContextAdjustments: parsed.worldContextAdjustments || {},
        };
      }
    } catch (error) {
      this.logger.error('Error parsing backstory analysis:', error);
    }

    // Fallback parsing
    return {
      characterArchetype: 'Balanced',
      suggestedStats: {
        'Sức Mạnh': 12,
        'Trí Tuệ': 12,
        'Khéo Léo': 12,
        'Thể Lực': 12,
        'Tinh Thần': 12,
        'Uy Tín': 12,
      },
      reasoning: 'Default balanced allocation due to parsing error',
      confidence: 0.5,
      detectedKeywords: [],
      worldContextAdjustments: {},
    };
  }

  private async getPointAllocationSystem(
    worldType: string,
  ): Promise<PointAllocationSystem> {
    return {
      totalPoints: 80, // Base points
      bonusPoints: 20, // Additional points for customization
      rules: [
        {
          statName: 'Sức Mạnh',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
        {
          statName: 'Trí Tuệ',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
        {
          statName: 'Khéo Léo',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
        {
          statName: 'Thể Lực',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
        {
          statName: 'Tinh Thần',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
        {
          statName: 'Uy Tín',
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'core',
        },
      ],
      worldType,
    };
  }

  private async validatePointAllocation(
    stats: Record<string, number>,
    pointSystem: PointAllocationSystem,
    totalPointsUsed: number,
  ): Promise<boolean> {
    const maxAllowed = pointSystem.totalPoints + pointSystem.bonusPoints;
    return totalPointsUsed <= maxAllowed;
  }

  private async convertToEnhancedStats(
    stats: Record<string, number>,
    worldType: string,
  ): Promise<EnhancedGameStats> {
    const enhancedStats: EnhancedGameStats = { ...stats };

    // Add derived stats
    if (stats['Thể Lực']) {
      const constitution = stats['Thể Lực'];
      enhancedStats['Sinh Lực'] = `${constitution * 5}/${constitution * 5}`;
    }

    if (stats['Trí Tuệ'] && worldType === 'Fantasy') {
      const intelligence = stats['Trí Tuệ'];
      enhancedStats['Mana'] = `${intelligence * 3}/${intelligence * 3}`;
    }

    // Add default values for missing stats
    if (!enhancedStats['Sinh Lực']) {
      enhancedStats['Sinh Lực'] = '100/100';
    }

    return enhancedStats;
  }

  private async saveAsCustomTemplate(
    userId: string,
    templateName: string,
    stats: Record<string, number>,
    game: Game,
  ): Promise<void> {
    const template: CharacterTemplate = {
      id: `custom_${Date.now()}_${userId}`,
      name: templateName,
      description: `Custom template created by user`,
      category: 'custom',
      worldTypes: [game.settings.theme],
      backstory: game.settings.characterBackstory,
      attributes: stats,
      skills: [],
      startingItems: [],
      traits: [],
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would be saved to database
    this.logger.log(
      `Saved custom template: ${template.name} for user ${userId}`,
    );
  }
}
