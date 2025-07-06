import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CharacterCreationService } from '../services/character-creation.service';
import {
  SelectTemplateDto,
  AnalyzeBackstoryDto,
  AllocateStatsDto,
  FinalizeCharacterDto,
  GetTemplatesDto,
  BackstoryAnalysisResponseDto,
  CharacterCreationResultDto,
  CreateCustomTemplateDto,
  CharacterTemplateDto,
} from '../dto/character-creation.dto';
import {
  CharacterTemplate,
  CharacterCreationSession,
} from '../interfaces/character-stats.interface';

@ApiTags('Character Creation')
@Controller('games/character-creation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CharacterCreationController {
  constructor(
    private readonly characterCreationService: CharacterCreationService,
  ) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get available character templates' })
  @ApiResponse({
    status: 200,
    description: 'List of available character templates',
    type: [CharacterTemplateDto],
  })
  async getTemplates(
    @Request() req: any,
    @Query() filters: GetTemplatesDto,
  ): Promise<CharacterTemplate[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.characterCreationService.getTemplates(userId, filters);
  }

  @Post('select-template')
  @ApiOperation({ summary: 'Select a character template' })
  @ApiResponse({
    status: 201,
    description: 'Template selected successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async selectTemplate(
    @Request() req: any,
    @Body() selectTemplateDto: SelectTemplateDto,
  ): Promise<CharacterCreationSession> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.characterCreationService.selectTemplate(
      userId,
      selectTemplateDto,
    );
  }

  @Post('analyze-backstory')
  @ApiOperation({ summary: 'Analyze character backstory and suggest stats' })
  @ApiResponse({
    status: 200,
    description: 'Backstory analysis completed',
    type: BackstoryAnalysisResponseDto,
  })
  async analyzeBackstory(
    @Request() req: any,
    @Body() analyzeDto: AnalyzeBackstoryDto,
  ): Promise<BackstoryAnalysisResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.characterCreationService.analyzeBackstory(userId, analyzeDto);
  }

  @Post('allocate-stats')
  @ApiOperation({ summary: 'Allocate character stats points' })
  @ApiResponse({
    status: 200,
    description: 'Stats allocation completed',
  })
  async allocateStats(
    @Request() req: any,
    @Body() allocateDto: AllocateStatsDto,
  ): Promise<CharacterCreationSession> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.characterCreationService.allocateStats(userId, allocateDto);
  }

  @Post('finalize')
  @ApiOperation({ summary: 'Finalize character creation' })
  @ApiResponse({
    status: 200,
    description: 'Character creation finalized successfully',
    type: CharacterCreationResultDto,
  })
  async finalizeCharacter(
    @Request() req: any,
    @Body() finalizeDto: FinalizeCharacterDto,
  ): Promise<CharacterCreationResultDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.characterCreationService.finalizeCharacter(userId, finalizeDto);
  }

  @Post('custom-template')
  @ApiOperation({ summary: 'Create a custom character template' })
  @ApiResponse({
    status: 201,
    description: 'Custom template created successfully',
    type: CharacterTemplateDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createCustomTemplate(
    @Request() req: any,
    @Body() createDto: CreateCustomTemplateDto,
  ): Promise<CharacterTemplate> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.characterCreationService.createCustomTemplate(
      userId,
      createDto,
    );
  }

  @Get('templates/:templateId')
  @ApiOperation({ summary: 'Get specific character template details' })
  @ApiResponse({
    status: 200,
    description: 'Template details retrieved',
    type: CharacterTemplateDto,
  })
  async getTemplateDetails(
    @Request() req: any,
    @Param('templateId') templateId: string,
    @Query('worldType') worldType?: string,
  ): Promise<CharacterTemplate> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Get all templates and find the requested one
    const templates = await this.characterCreationService.getTemplates(userId, {
      worldType,
      includeCustom: true,
    });

    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      throw new BadRequestException('Template not found');
    }

    return template;
  }

  @Get('point-allocation/:worldType')
  @ApiOperation({ summary: 'Get point allocation rules for a world type' })
  @ApiResponse({
    status: 200,
    description: 'Point allocation rules retrieved',
  })
  async getPointAllocationRules(
    @Param('worldType') worldType: string,
  ): Promise<any> {
    return this.characterCreationService['getPointAllocationSystem'](worldType);
  }

  @Get('session/:gameId')
  @ApiOperation({ summary: 'Get character creation session status' })
  @ApiResponse({
    status: 200,
    description: 'Character creation session retrieved',
  })
  async getCharacterCreationSession(
    @Request() req: any,
    @Param('gameId') gameId: string,
  ): Promise<Partial<CharacterCreationSession>> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // In a real implementation, this would retrieve from database
    // For now, return a basic session structure
    return {
      gameId,
      userId,
      currentStep: 'template',
      steps: [
        {
          step: 'template',
          completed: false,
          data: {},
        },
        {
          step: 'backstory',
          completed: false,
          data: {},
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
      totalPointsAllocated: 0,
      maxPointsAllowed: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Post('validate-stats')
  @ApiOperation({ summary: 'Validate character stats allocation' })
  @ApiResponse({
    status: 200,
    description: 'Stats validation result',
  })
  async validateStats(
    @Body() body: { stats: Record<string, number>; worldType: string },
  ): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
    const { stats, worldType } = body;

    // Get the point allocation system for this world type
    const pointSystem =
      await this.characterCreationService['getPointAllocationSystem'](
        worldType,
      );

    // Validate stats using the rules
    const errors: string[] = [];
    const warnings: string[] = [];
    const individualStatErrors: Record<string, string[]> = {};

    let totalPointsUsed = 0;

    // Check each stat against the rules
    Object.entries(stats).forEach(([statName, value]) => {
      const rule = pointSystem.rules.find((r) => r.statName === statName);
      if (!rule) {
        // If the stat is not found in the rules, use default values
        console.warn(
          `Stat not found in rules: ${statName}. Using default values.`,
        );

        // Add a default rule for this stat
        pointSystem.rules.push({
          statName: statName,
          baseCost: 1,
          scalingFactor: 1.2,
          maxValue: 20,
          minValue: 6,
          category: 'custom',
        });

        // Don't add an error, just continue with the default rule
        totalPointsUsed += value;
        return;
      }

      if (value < rule.minValue) {
        errors.push(`${statName} cannot be less than ${rule.minValue}`);
      }
      if (value > rule.maxValue) {
        errors.push(`${statName} cannot be greater than ${rule.maxValue}`);
      }

      // Calculate points used (simplified for this example)
      totalPointsUsed += value;
    });

    // Check total points
    const maxPointsAllowed = pointSystem.totalPoints + pointSystem.bonusPoints;
    if (totalPointsUsed > maxPointsAllowed) {
      errors.push(
        `Total points used (${totalPointsUsed}) exceeds maximum allowed (${maxPointsAllowed})`,
      );
    }

    if (totalPointsUsed < pointSystem.totalPoints * 0.8) {
      warnings.push(
        'You have many unused points. Consider allocating them to improve your character.',
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
