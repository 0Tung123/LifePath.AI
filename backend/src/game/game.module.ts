import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, GameSession, StoryNode, Choice, User]),
    ConfigModule,
  ],
  controllers: [GameController],
  providers: [GameService, GeminiAiService, CharacterGeneratorService],
  exports: [GameService, CharacterGeneratorService],
})
export class GameModule {}
