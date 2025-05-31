import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, GameSession, StoryNode, Choice]),
  ],
  controllers: [GameController],
  providers: [GameService, GeminiAiService, CharacterGeneratorService],
  exports: [GameService, CharacterGeneratorService],
})
export class GameModule {}
