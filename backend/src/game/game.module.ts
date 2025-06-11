import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { Quest } from './entities/quest.entity';
import { CharacterDeath } from './entities/character-death.entity';
import { Legacy } from './entities/legacy.entity';
import { Consequence } from './entities/consequence.entity';
import { Bookmark } from './entities/bookmark.entity';
import { MiniGame } from './entities/mini-game.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { WorldStateService } from './world-state.service';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { PermadeathService } from './permadeath.service';
import { LegacyService } from './legacy.service';
import { ConsequenceService } from './consequence.service';
import { CustomInputService } from './custom-input.service';
import { CustomInputController } from './custom-input.controller';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { MiniGameService } from './mini-game.service';
import { MiniGameController } from './mini-game.controller';
import { ProfileLearningService } from './profile-learning.service';
import { User } from '../user/entities/user.entity';
import { GenresController } from './genres.controller';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      GameSession,
      StoryNode,
      Choice,
      Quest,
      User,
      CharacterDeath,
      Legacy,
      Consequence,
      Bookmark,
      MiniGame,
    ]),
    ConfigModule,
    MemoryModule,
  ],
  controllers: [
    GameController,
    QuestController,
    CustomInputController,
    BookmarkController,
    MiniGameController,
    GenresController,
  ],
  providers: [
    GameService,
    GeminiAiService,
    CharacterGeneratorService,
    WorldStateService,
    QuestService,
    PermadeathService,
    LegacyService,
    ConsequenceService,
    CustomInputService,
    BookmarkService,
    MiniGameService,
    ProfileLearningService,
  ],
  exports: [
    GameService,
    CharacterGeneratorService,
    WorldStateService,
    QuestService,
    PermadeathService,
    LegacyService,
    ConsequenceService,
    CustomInputService,
    BookmarkService,
    MiniGameService,
    ProfileLearningService,
  ],
})
export class GameModule {}
