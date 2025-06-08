import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestService } from './quest.service';
import { Quest, QuestStatus } from './entities/quest.entity';

@Controller('game/quests')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post('generate')
  async generateQuest(
    @Body()
    data: {
      gameSessionId: string;
      trigger: string;
      triggerType: 'item' | 'location' | 'npc' | 'event';
    },
  ): Promise<Quest> {
    return this.questService.generateQuest(
      data.gameSessionId,
      data.trigger,
      data.triggerType,
    );
  }

  @Get('session/:gameSessionId')
  async getQuestsByGameSession(
    @Param('gameSessionId') gameSessionId: string,
  ): Promise<Quest[]> {
    return this.questService.getQuestsByGameSession(gameSessionId);
  }

  @Get(':id')
  async getQuestById(@Param('id') id: string): Promise<Quest> {
    return this.questService.getQuestById(id);
  }

  @Put(':id/status')
  async updateQuestStatus(
    @Param('id') id: string,
    @Body() data: { status: QuestStatus },
  ): Promise<Quest> {
    return this.questService.updateQuestStatus(id, data.status);
  }
}
