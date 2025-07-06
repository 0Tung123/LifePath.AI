import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { GameActionDto } from './dto/game-action.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { LifeSummary } from './interfaces/game-content.interface';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully',
    type: Game,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Request() req,
    @Body() createGameDto: CreateGameDto,
  ): Promise<Game> {
    // Validate essential fields
    const { gameSettings } = createGameDto;
    if (!gameSettings) {
      throw new BadRequestException('Game settings are required');
    }

    // Extract user ID from JWT
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Create the game
    return this.gamesService.create(userId, createGameDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all games for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of games retrieved successfully',
    type: [Game],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Request() req): Promise<Game[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.gamesService.findAllByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully',
    type: Game,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Game not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Game> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.gamesService.findOne(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Game deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Game not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.gamesService.remove(id, userId);
  }

  @Post(':id/action')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a player action in the game' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: GameActionDto })
  @ApiResponse({
    status: 200,
    description: 'Action processed successfully',
    type: Game,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or game not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processAction(
    @Param('id') id: string,
    @Request() req,
    @Body() actionDto: GameActionDto,
  ): Promise<Game> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const { choiceNumber, action, think, communication } = actionDto;

    return this.gamesService.processAction(
      id,
      userId,
      choiceNumber,
      action,
      think,
      communication,
    );
  }

  @Get(':id/life-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get character life summary (for death screen)' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Life summary retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Game not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLifeSummary(
    @Param('id') id: string,
    @Request() req,
  ): Promise<LifeSummary> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.gamesService.generateLifeSummary(id);
  }

  @Post(':id/summary')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate story summary using AI' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Summary generated successfully',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'AI-generated story summary',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Game not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateSummary(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ summary: string }> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const summary = await this.gamesService.generateSummary(id, userId);
    return { summary };
  }

  @Post(':id/resurrect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resurrect character with penalties' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Character resurrected successfully',
    type: Game,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot resurrect' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resurrectCharacter(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Game> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.gamesService.resurrectCharacter(id, userId);
  }
}
