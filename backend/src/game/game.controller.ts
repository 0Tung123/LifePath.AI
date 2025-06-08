import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Character, GameGenre } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Character endpoints
  @Post('characters')
  async createCharacter(
    @Request() req,
    @Body() characterData: Partial<Character>,
  ): Promise<Character> {
    return this.gameService.createCharacter(req.user.id, characterData);
  }

  @Post('characters/generate')
  async generateCharacter(
    @Request() req,
    @Body()
    data: {
      description: string;
      primaryGenre?: GameGenre;
      secondaryGenres?: GameGenre[];
      customGenreDescription?: string;
    },
  ): Promise<Character> {
    return this.gameService.generateCharacterFromDescription(
      req.user.id,
      data.description,
      data.primaryGenre,
      data.secondaryGenres,
      data.customGenreDescription,
    );
  }

  @Get('characters')
  async getMyCharacters(@Request() req): Promise<Character[]> {
    return this.gameService.getCharactersByUserId(req.user.id);
  }

  @Get('characters/:id')
  async getCharacter(@Param('id') id: string): Promise<Character> {
    return this.gameService.getCharacterById(id);
  }

  @Get('genres')
  async getAvailableGenres(): Promise<
    { id: string; name: string; description: string }[]
  > {
    return [
      {
        id: GameGenre.FANTASY,
        name: 'Fantasy',
        description:
          'Thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí',
      },
      {
        id: GameGenre.MODERN,
        name: 'Modern',
        description: 'Thế giới hiện đại với công nghệ và xã hội như thực tế',
      },
      {
        id: GameGenre.SCIFI,
        name: 'Sci-Fi',
        description:
          'Thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ',
      },
      {
        id: GameGenre.XIANXIA,
        name: 'Tiên Hiệp',
        description: 'Thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới',
      },
      {
        id: GameGenre.WUXIA,
        name: 'Võ Hiệp',
        description: 'Thế giới võ thuật, giang hồ, kiếm hiệp',
      },
      {
        id: GameGenre.HORROR,
        name: 'Horror',
        description:
          'Thế giới đầy rẫy những sinh vật kinh dị, ma quỷ và sự sợ hãi',
      },
      {
        id: GameGenre.CYBERPUNK,
        name: 'Cyberpunk',
        description:
          'Thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể',
      },
      {
        id: GameGenre.STEAMPUNK,
        name: 'Steampunk',
        description:
          'Thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria',
      },
      {
        id: GameGenre.POSTAPOCALYPTIC,
        name: 'Post-Apocalyptic',
        description: 'Thế giới sau thảm họa toàn cầu, con người phải sinh tồn',
      },
      {
        id: GameGenre.HISTORICAL,
        name: 'Historical',
        description: 'Thế giới dựa trên các giai đoạn lịch sử thực tế',
      },
    ];
  }

  // Game session endpoints
  @Post('sessions')
  async startNewGame(
    @Body() data: { characterId: string },
  ): Promise<GameSession> {
    return this.gameService.startGameSession(data.characterId);
  }

  @Get('sessions')
  async getMyActiveSessions(@Request() req): Promise<GameSession[]> {
    // Lấy tất cả các phiên game của người dùng
    const allSessions = await this.gameService.getGameSessionsByCharacterId(
      req.user.id,
    );
    // Lọc ra các phiên đang hoạt động
    return allSessions.filter((session) => session.isActive);
  }

  @Get('sessions/:id')
  async getGameSession(@Param('id') id: string): Promise<GameSession> {
    return this.gameService.getGameSessionWithDetails(id);
  }

  @Get('sessions/:id/history')
  async getGameSessionHistory(@Param('id') id: string) {
    return this.gameService.getGameSessionHistory(id);
  }

  @Get('sessions/:id/path-history')
  async getActualPathHistory(@Param('id') id: string) {
    return this.gameService.getActualPathHistory(id);
  }

  @Get('sessions/:id/branches')
  async getAllBranches(@Param('id') id: string) {
    return this.gameService.getAllBranches(id);
  }

  @Post('sessions/:id/restore-branch/:branchId')
  async restoreBranch(
    @Param('id') sessionId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.gameService.restoreBranch(sessionId, branchId);
  }

  @Put('sessions/:id/save')
  async saveGame(@Param('id') id: string): Promise<GameSession> {
    // Lấy phiên game hiện tại
    const session = await this.gameService.getGameSessionWithDetails(id);
    // Trả về phiên game đã lưu
    return session;
  }

  @Put('sessions/:id/end')
  async endGame(@Param('id') id: string): Promise<GameSession> {
    return this.gameService.endGameSession(id);
  }

  @Delete('sessions/:id')
  async deleteGameSession(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    return this.gameService.deleteGameSession(id, req.user.id);
  }

  @Delete('characters/:id')
  async deleteCharacter(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    return this.gameService.deleteCharacter(id, req.user.id);
  }

  // Game progression
  @Post('sessions/:id/choices/:choiceId')
  async makeChoice(
    @Param('id') id: string,
    @Param('choiceId') choiceId: string,
  ): Promise<GameSession> {
    return this.gameService.makeChoice(id, choiceId);
  }

  @Post('sessions/:id/go-back/:nodeId')
  async goBackToNode(
    @Param('id') sessionId: string,
    @Param('nodeId') nodeId: string,
  ) {
    return this.gameService.goBackToNode(sessionId, nodeId);
  }

  @Get('sessions/:id/tree')
  async getStoryTree(@Param('id') sessionId: string) {
    return this.gameService.getStoryTree(sessionId);
  }
}
