"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorldStateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldStateService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_entity_1 = require("./entities/character.entity");
const memory_service_1 = require("../memory/memory.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
let WorldStateService = WorldStateService_1 = class WorldStateService {
    constructor(gameSessionRepository, characterRepository, memoryService, configService) {
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
        this.memoryService = memoryService;
        this.configService = configService;
        this.logger = new common_1.Logger(WorldStateService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set');
            return;
        }
        this.geminiAi = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.generationModel = this.geminiAi.getGenerativeModel({
            model: 'gemini-2.0-flash',
        });
    }
    async updateWorldState() {
        this.logger.log('Updating world state...');
        try {
            const activeSessions = await this.gameSessionRepository.find({
                where: { isActive: true },
                relations: ['character'],
            });
            for (const session of activeSessions) {
                const lastActivity = session.updatedAt;
                const now = new Date();
                const hoursSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
                if (hoursSinceLastActivity >= 3) {
                    await this.generateWorldEvents(session);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error updating world state: ${error.message}`);
        }
    }
    async generateWorldEvents(session) {
        try {
            const character = session.character;
            const existingMemories = await this.memoryService.findRelevantMemories('', character.id, 10);
            let memoriesContext = '';
            if (existingMemories.length > 0) {
                memoriesContext = 'Các sự kiện đã xảy ra trước đó:\n';
                existingMemories.forEach((memory) => {
                    memoriesContext += `- ${memory.title}: ${memory.content}\n`;
                });
            }
            const worldContext = `
Nhân vật: ${character.name}, ${character.characterClass}
Thế giới: ${character.primaryGenre}
Thời gian trong ngày: ${session.timeOfDay || 'MORNING'}
Mùa: ${session.season || 'SPRING'}
Ngày trong mùa: ${session.seasonDay || 1}
Thời gian kể từ hoạt động cuối: ${Math.floor((new Date().getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60))} giờ
${memoriesContext}
      `;
            const prompt = `
Hãy tạo ra 1-3 sự kiện đã xảy ra trong thế giới game trong khoảng thời gian người chơi vắng mặt.
Những sự kiện này nên liên quan đến bối cảnh thế giới, các phe phái hoặc NPC đã xuất hiện trước đó.
Hãy trả về kết quả theo format JSON:
[
  {
    "title": "Tên sự kiện ngắn gọn",
    "content": "Mô tả chi tiết về sự kiện",
    "importance": số từ 0.1 đến 1.0 thể hiện mức độ quan trọng,
    "affectedLocationId": "ID của địa điểm bị ảnh hưởng (nếu có)",
    "affectedFactionId": "ID của phe phái bị ảnh hưởng (nếu có)"
  }
]

Thông tin về nhân vật và thế giới:
${worldContext}
`;
            const result = await this.generationModel.generateContent(prompt);
            const textResult = result.response.text();
            let events = [];
            try {
                const jsonMatch = textResult.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    events = JSON.parse(jsonMatch[0]);
                }
            }
            catch (error) {
                this.logger.error(`Error parsing events JSON: ${error.message}`);
                return;
            }
            for (const event of events) {
                await this.memoryService.createMemory({
                    title: event.title,
                    content: event.content,
                    type: memory_record_entity_1.MemoryType.EVENT,
                    characterId: character.id,
                    gameSessionId: session.id,
                    importance: event.importance || 0.5,
                });
                if (event.affectedLocationId && session.worldState?.locations) {
                    const location = session.worldState.locations.find((l) => l.id === event.affectedLocationId);
                    if (location) {
                        await this.updateLocationState(session.id, event.affectedLocationId, 'affected_by_event', event.title);
                    }
                }
                if (event.affectedFactionId && session.worldState?.factions) {
                    const reputationChange = Math.floor(Math.random() * 20 - 10);
                    await this.updateFactionReputation(session.id, event.affectedFactionId, reputationChange);
                }
            }
            await this.advanceTime(session);
            this.logger.log(`Generated ${events.length} events for session ${session.id}`);
        }
        catch (error) {
            this.logger.error(`Error generating world events: ${error.message}`);
        }
    }
    async advanceTime(session) {
        try {
            const hoursSinceLastActivity = Math.floor((new Date().getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60));
            if (hoursSinceLastActivity >= 6) {
                const timeOfDayValues = Object.values(story_node_entity_1.TimeOfDay);
                const currentIndex = timeOfDayValues.indexOf(session.timeOfDay);
                const nextIndex = (currentIndex + 1) % timeOfDayValues.length;
                const newTimeOfDay = timeOfDayValues[nextIndex];
                await this.changeTimeOfDay(session.id, newTimeOfDay);
                if (newTimeOfDay === story_node_entity_1.TimeOfDay.DAWN) {
                    session.seasonDay += 1;
                    if (session.seasonDay > 30) {
                        const seasonValues = Object.values(story_node_entity_1.Season);
                        const currentSeasonIndex = seasonValues.indexOf(session.season);
                        const nextSeasonIndex = (currentSeasonIndex + 1) % seasonValues.length;
                        const newSeason = seasonValues[nextSeasonIndex];
                        await this.changeSeason(session.id, newSeason);
                    }
                    else {
                        await this.gameSessionRepository.save(session);
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Error advancing time: ${error.message}`);
        }
    }
    async changeTimeOfDay(gameSessionId, newTimeOfDay) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        const oldTimeOfDay = gameSession.timeOfDay;
        gameSession.timeOfDay = newTimeOfDay;
        if (gameSession.worldState && gameSession.worldState.npcs) {
            for (const npc of gameSession.worldState.npcs) {
                if (npc.schedule && npc.schedule[newTimeOfDay]) {
                    npc.currentLocationId = npc.schedule[newTimeOfDay].locationId;
                }
            }
        }
        await this.memoryService.createMemory({
            title: `Thời gian chuyển sang ${newTimeOfDay}`,
            content: `Thời gian trong ngày đã chuyển từ ${oldTimeOfDay} sang ${newTimeOfDay}.`,
            type: memory_record_entity_1.MemoryType.WORLD_CHANGE,
            gameSessionId: gameSessionId,
            characterId: gameSession.character.id,
            importance: 0.3,
        });
        return this.gameSessionRepository.save(gameSession);
    }
    async changeSeason(gameSessionId, newSeason) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        const oldSeason = gameSession.season;
        gameSession.season = newSeason;
        gameSession.seasonDay = 1;
        await this.memoryService.createMemory({
            title: `Mùa chuyển sang ${newSeason}`,
            content: `Mùa đã chuyển từ ${oldSeason} sang ${newSeason}. Cây cối và thời tiết đã thay đổi để phản ánh mùa mới.`,
            type: memory_record_entity_1.MemoryType.WORLD_CHANGE,
            gameSessionId: gameSessionId,
            characterId: gameSession.character.id,
            importance: 0.7,
        });
        return this.gameSessionRepository.save(gameSession);
    }
    async updateFactionReputation(gameSessionId, factionId, amount) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        if (!gameSession.worldState || !gameSession.worldState.factions) {
            throw new common_1.NotFoundException('World state or factions not initialized');
        }
        const faction = gameSession.worldState.factions.find((f) => f.id === factionId);
        if (!faction) {
            throw new common_1.NotFoundException(`Faction with ID ${factionId} not found`);
        }
        faction.reputation = Math.max(-100, Math.min(100, faction.reputation + amount));
        if (gameSession.worldState.npcs) {
            for (const npc of gameSession.worldState.npcs) {
                if (npc.factionIds && npc.factionIds.includes(factionId)) {
                    npc.reputation = Math.max(-100, Math.min(100, npc.reputation + amount / 2));
                    if (npc.reputation >= 75) {
                        npc.relationship = 'allied';
                    }
                    else if (npc.reputation >= 25) {
                        npc.relationship = 'friendly';
                    }
                    else if (npc.reputation >= -25) {
                        npc.relationship = 'neutral';
                    }
                    else {
                        npc.relationship = 'hostile';
                    }
                }
            }
        }
        if (gameSession.character.factionReputations) {
            const charFactionRep = gameSession.character.factionReputations.find((fr) => fr.factionId === factionId);
            if (charFactionRep) {
                charFactionRep.reputation = Math.max(-100, Math.min(100, charFactionRep.reputation + amount));
            }
            else {
                gameSession.character.factionReputations.push({
                    factionId: factionId,
                    factionName: faction.name,
                    reputation: amount,
                });
            }
            await this.characterRepository.save(gameSession.character);
        }
        const reputationChangeText = amount >= 0 ? 'tăng' : 'giảm';
        await this.memoryService.createMemory({
            title: `Danh tiếng với ${faction.name} ${reputationChangeText}`,
            content: `Danh tiếng của bạn với ${faction.name} đã ${reputationChangeText} ${Math.abs(amount)} điểm, hiện tại là ${faction.reputation}.`,
            type: memory_record_entity_1.MemoryType.REPUTATION,
            gameSessionId: gameSessionId,
            characterId: gameSession.character.id,
            importance: Math.abs(amount) / 20,
        });
        await this.gameSessionRepository.save(gameSession);
        return { faction, newReputation: faction.reputation };
    }
    async updateLocationState(gameSessionId, locationId, newState, reason) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        if (!gameSession.worldState || !gameSession.worldState.locations) {
            throw new common_1.NotFoundException('World state or locations not initialized');
        }
        const location = gameSession.worldState.locations.find((l) => l.id === locationId);
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID ${locationId} not found`);
        }
        if (!gameSession.worldState.changedLocations) {
            gameSession.worldState.changedLocations = {};
        }
        gameSession.worldState.changedLocations[locationId] = {
            previousState: location.currentState,
            newState: newState,
            reason: reason,
            timestamp: new Date(),
        };
        const oldState = location.currentState;
        location.currentState = newState;
        await this.memoryService.createMemory({
            title: `${location.name} đã thay đổi`,
            content: `${location.name} đã thay đổi từ ${oldState} sang ${newState} vì: ${reason}`,
            type: memory_record_entity_1.MemoryType.LOCATION_CHANGE,
            gameSessionId: gameSessionId,
            characterId: gameSession.character.id,
            importance: 0.6,
        });
        await this.gameSessionRepository.save(gameSession);
        return location;
    }
    async initializeWorldState(gameSessionId, worldData) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        gameSession.worldState = {
            locations: worldData.locations,
            npcs: worldData.npcs,
            factions: worldData.factions,
            changedLocations: {},
        };
        return this.gameSessionRepository.save(gameSession);
    }
    async getWorldState(gameSessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        return {
            timeOfDay: gameSession.timeOfDay,
            season: gameSession.season,
            seasonDay: gameSession.seasonDay,
            worldState: gameSession.worldState,
        };
    }
};
exports.WorldStateService = WorldStateService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorldStateService.prototype, "updateWorldState", null);
exports.WorldStateService = WorldStateService = WorldStateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(1, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        memory_service_1.MemoryService,
        config_1.ConfigService])
], WorldStateService);
//# sourceMappingURL=world-state.service.js.map