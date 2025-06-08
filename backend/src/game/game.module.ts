import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { StoryPath } from './entities/story-path.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { User } from '../user/entities/user.entity';
import { StoryPromptService } from './story-prompt.service';
import { StoryPromptController } from './story-prompt.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      GameSession,
      StoryNode,
      Choice,
      StoryPath,
      User,
    ]),
    ConfigModule,
  ],
  controllers: [GameController, StoryPromptController],
  providers: [GameService, GeminiAiService, CharacterGeneratorService, StoryPromptService],
  exports: [GameService, CharacterGeneratorService, StoryPromptService],
})
export class GameModule {}
