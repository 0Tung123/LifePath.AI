import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { ChineseNovel } from './entities/chinese-novel.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { ChineseNovelService } from './chinese-novel.service';
import { ChineseNovelController } from './chinese-novel.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      GameSession,
      StoryNode,
      Choice,
      ChineseNovel,
      User,
    ]),
    ConfigModule,
  ],
  controllers: [GameController, ChineseNovelController],
  providers: [
    GameService,
    GeminiAiService,
    CharacterGeneratorService,
    ChineseNovelService,
  ],
  exports: [GameService, CharacterGeneratorService, ChineseNovelService],
})
export class GameModule {}
