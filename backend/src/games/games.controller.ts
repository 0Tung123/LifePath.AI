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
import { UpdateWorldStateDto } from './dto/update-world-state.dto';
import { UpdateNpcRelationshipDto } from './dto/update-npc-relationship.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { UpdateStatusEffectsDto } from './dto/update-status-effect.dto';
import { UpdateGameEventDto } from './dto/update-game-event.dto';
import { Game } from './entities/game.entity';
import { LifeSummary } from './interfaces/game-content.interface';

// Define authenticated request interface
interface AuthenticatedRequest {
  user: {
    userId: string;
  };
}

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
    @Request() req: AuthenticatedRequest,
    @Body() createGameDto: CreateGameDto,
  ): Promise<Game> {
    // Validate essential fields
    const { gameSettings } = createGameDto;
    if (!gameSettings) {
      throw new BadRequestException('Game settings are required');
    }

    // Extract user ID from JWT
    const userId = req.user.userId;

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
  async findAll(@Request() req: AuthenticatedRequest): Promise<Game[]> {
    const userId = req.user.userId;
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
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Game> {
    const userId = req.user.userId;
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
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    const userId = req.user.userId;
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
    @Request() req: AuthenticatedRequest,
    @Body() actionDto: GameActionDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    const {
      choiceNumber,
      action,
      think,
      communication,
      actionType,
      actionTarget,
      actionContext,
      actionIntensity,
      actionIntent,
      actionMetadata,
    } = actionDto;

    return this.gamesService.processAction(
      id,
      userId,
      choiceNumber,
      action,
      think,
      communication,
      actionType,
      actionTarget,
      actionContext,
      actionIntensity,
      actionIntent,
      actionMetadata,
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
    @Request() _req: AuthenticatedRequest,
  ): Promise<LifeSummary> {
    // userId could be used for authorization in the future
    // const userId = req.user.userId;
    return this.gamesService.generateLifeSummary(id);
  }

  @Post(':id/world-state')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update game world state' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateWorldStateDto })
  @ApiResponse({
    status: 200,
    description: 'World state updated successfully',
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
  async updateWorldState(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateWorldStateDto: UpdateWorldStateDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.updateWorldState(id, userId, updateWorldStateDto);
  }

  @Post(':id/npc-relationship')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update NPC relationship' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateNpcRelationshipDto })
  @ApiResponse({
    status: 200,
    description: 'NPC relationship updated successfully',
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
  async updateNpcRelationship(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateNpcRelationshipDto: UpdateNpcRelationshipDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.updateNpcRelationship(
      id,
      userId,
      updateNpcRelationshipDto,
    );
  }

  @Post(':id/quest')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update or add quest' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateQuestDto })
  @ApiResponse({
    status: 200,
    description: 'Quest updated successfully',
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
  async updateQuest(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateQuestDto: UpdateQuestDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.updateQuest(id, userId, updateQuestDto);
  }

  @Post(':id/status-effects')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update player status effects' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateStatusEffectsDto })
  @ApiResponse({
    status: 200,
    description: 'Status effects updated successfully',
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
  async updateStatusEffects(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateStatusEffectsDto: UpdateStatusEffectsDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.updateStatusEffects(
      id,
      userId,
      updateStatusEffectsDto,
    );
  }

  @Post(':id/events')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update game events' })
  @ApiParam({ name: 'id', description: 'Game ID', type: 'string' })
  @ApiBody({ type: UpdateGameEventDto })
  @ApiResponse({
    status: 200,
    description: 'Game events updated successfully',
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
  async updateGameEvents(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateGameEventDto: UpdateGameEventDto,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.updateGameEvents(id, userId, updateGameEventDto);
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
    @Request() req: AuthenticatedRequest,
  ): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.resurrectCharacter(id, userId);
  }
}
