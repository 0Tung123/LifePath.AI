import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GeminiService } from './gemini.service';
import { NPCService } from './services/npc.service';
import { NPCController } from './controllers/npc.controller';
import { CharacterCreationService } from './services/character-creation.service';
import { CharacterCreationController } from './controllers/character-creation.controller';
import { Game } from './entities/game.entity';
import { NPC, NPCInteraction, NPCNotification } from './entities/npc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, NPC, NPCInteraction, NPCNotification]),
    ConfigModule,
  ],
  controllers: [GamesController, NPCController, CharacterCreationController],
  providers: [
    GamesService,
    GeminiService,
    NPCService,
    CharacterCreationService,
  ],
  exports: [GamesService, NPCService, CharacterCreationService],
})
export class GamesModule {}
