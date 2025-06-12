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
} from '@nestjs/common';
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
  async findAll(@Request() req): Promise<Game[]> {
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
  async findOne(@Param('id') id: string, @Request() req): Promise<Game> {
    const userId = req.user.userId;
    return this.gamesService.findOne(id, userId);
  }
}
