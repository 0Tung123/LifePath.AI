import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { MiniGameService } from './mini-game.service';
import { MiniGame, MiniGameType } from './entities/mini-game.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('mini-games')
@Controller('mini-games')
@UseGuards(JwtAuthGuard)
export class MiniGameController {
  constructor(private readonly miniGameService: MiniGameService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mini-game' })
  @ApiResponse({ status: 201, description: 'Mini-game created successfully' })
  async createMiniGame(
    @Body()
    createMiniGameDto: {
      name: string;
      description: string;
      type: MiniGameType;
      difficulty: number;
      mandatory: boolean;
      completionNodeId?: string;
      failureNodeId?: string;
      rewards?: {
        experience?: number;
        gold?: number;
        items?: {
          id: string;
          name: string;
          quantity: number;
        }[];
        skills?: {
          id: string;
          experience: number;
        }[];
        traits?: Record<string, number>;
      };
      config: Record<string, any>;
    },
  ): Promise<MiniGame> {
    try {
      return await this.miniGameService.createMiniGame(createMiniGameDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mini-game by ID' })
  @ApiResponse({ status: 200, description: 'Return the mini-game' })
  @ApiResponse({ status: 404, description: 'Mini-game not found' })
  async getMiniGame(@Param('id') id: string): Promise<MiniGame> {
    return this.miniGameService.getMiniGame(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mini-game' })
  @ApiResponse({ status: 200, description: 'Mini-game deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mini-game not found' })
  async deleteMiniGame(@Param('id') id: string): Promise<{ message: string }> {
    await this.miniGameService.deleteMiniGame(id);
    return { message: 'Mini-game deleted successfully' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a mini-game' })
  @ApiResponse({ status: 200, description: 'Mini-game updated successfully' })
  @ApiResponse({ status: 404, description: 'Mini-game not found' })
  async updateMiniGame(
    @Param('id') id: string,
    @Body()
    updateMiniGameDto: Partial<{
      name: string;
      description: string;
      difficulty: number;
      mandatory: boolean;
      completionNodeId: string;
      failureNodeId: string;
      rewards: {
        experience?: number;
        gold?: number;
        items?: {
          id: string;
          name: string;
          quantity: number;
        }[];
        skills?: {
          id: string;
          experience: number;
        }[];
        traits?: Record<string, number>;
      };
      config: Record<string, any>;
    }>,
  ): Promise<MiniGame> {
    return this.miniGameService.updateMiniGame(id, updateMiniGameDto);
  }

  @Post(':id/result')
  @ApiOperation({ summary: 'Handle mini-game result' })
  @ApiResponse({ status: 200, description: 'Mini-game result processed successfully' })
  async handleMiniGameResult(
    @Param('id') id: string,
    @Body()
    resultDto: {
      gameSessionId: string;
      success: boolean;
      score?: number;
    },
  ): Promise<{
    nextNodeId: string;
    rewards?: any;
  }> {
    return this.miniGameService.handleMiniGameResult(
      id,
      resultDto.gameSessionId,
      resultDto.success,
      resultDto.score,
    );
  }
}