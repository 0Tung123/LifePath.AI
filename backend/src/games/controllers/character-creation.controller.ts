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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;

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
    // This would normally be handled by the service
    // For now, return a basic structure
    return {
      totalPoints: 80,
      bonusPoints: 20,
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
    const userId = req.user.userId;

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
  ): Promise<{ valid: boolean; errors?: string[] }> {
    const { stats, worldType } = body;

    // Basic validation logic
    const errors: string[] = [];
    const totalPoints = Object.values(stats).reduce(
      (sum, value) => sum + value,
      0,
    );

    if (totalPoints > 100) {
      errors.push('Total points exceed maximum allowed (100)');
    }

    // Validate individual stats
    Object.entries(stats).forEach(([statName, value]) => {
      if (value < 6) {
        errors.push(`${statName} cannot be less than 6`);
      }
      if (value > 20) {
        errors.push(`${statName} cannot be greater than 20`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
