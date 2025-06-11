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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mini_game_entity_1 = require("./entities/mini-game.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
const character_entity_1 = require("./entities/character.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
let MiniGameService = class MiniGameService {
    constructor(miniGameRepository, storyNodeRepository, gameSessionRepository, characterRepository) {
        this.miniGameRepository = miniGameRepository;
        this.storyNodeRepository = storyNodeRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
    }
    async createMiniGame(createMiniGameDto) {
        if (createMiniGameDto.completionNodeId) {
            const completionNode = await this.storyNodeRepository.findOne({
                where: { id: createMiniGameDto.completionNodeId },
            });
            if (!completionNode) {
                throw new common_1.NotFoundException(`Completion node with ID ${createMiniGameDto.completionNodeId} not found`);
            }
        }
        if (createMiniGameDto.failureNodeId) {
            const failureNode = await this.storyNodeRepository.findOne({
                where: { id: createMiniGameDto.failureNodeId },
            });
            if (!failureNode) {
                throw new common_1.NotFoundException(`Failure node with ID ${createMiniGameDto.failureNodeId} not found`);
            }
        }
        const miniGame = this.miniGameRepository.create(createMiniGameDto);
        return this.miniGameRepository.save(miniGame);
    }
    async getMiniGame(id) {
        const miniGame = await this.miniGameRepository.findOne({
            where: { id },
            relations: ['completionNode', 'failureNode'],
        });
        if (!miniGame) {
            throw new common_1.NotFoundException(`Mini-game with ID ${id} not found`);
        }
        return miniGame;
    }
    async deleteMiniGame(id) {
        const result = await this.miniGameRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Mini-game with ID ${id} not found`);
        }
    }
    async updateMiniGame(id, updateMiniGameDto) {
        const miniGame = await this.getMiniGame(id);
        if (updateMiniGameDto.completionNodeId) {
            const completionNode = await this.storyNodeRepository.findOne({
                where: { id: updateMiniGameDto.completionNodeId },
            });
            if (!completionNode) {
                throw new common_1.NotFoundException(`Completion node with ID ${updateMiniGameDto.completionNodeId} not found`);
            }
            miniGame.completionNodeId = updateMiniGameDto.completionNodeId;
        }
        if (updateMiniGameDto.failureNodeId) {
            const failureNode = await this.storyNodeRepository.findOne({
                where: { id: updateMiniGameDto.failureNodeId },
            });
            if (!failureNode) {
                throw new common_1.NotFoundException(`Failure node with ID ${updateMiniGameDto.failureNodeId} not found`);
            }
            miniGame.failureNodeId = updateMiniGameDto.failureNodeId;
        }
        Object.assign(miniGame, updateMiniGameDto);
        return this.miniGameRepository.save(miniGame);
    }
    async handleMiniGameResult(miniGameId, gameSessionId, success, score) {
        const miniGame = await this.getMiniGame(miniGameId);
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        const nextNodeId = success
            ? miniGame.completionNodeId
            : miniGame.failureNodeId;
        if (!nextNodeId) {
            throw new common_1.NotFoundException('No next node defined for this mini-game result');
        }
        let rewards = null;
        if (success && miniGame.rewards) {
            rewards = miniGame.rewards;
            const character = gameSession.character;
            if (miniGame.rewards.experience) {
                character.experience += miniGame.rewards.experience;
                if (character.experience >= character.experienceToNextLevel) {
                    await this.handleLevelUp(character);
                }
            }
            if (miniGame.rewards.gold) {
                if (!character.inventory.currency) {
                    character.inventory.currency = {};
                }
                if (character.inventory.currency.gold) {
                    character.inventory.currency.gold += miniGame.rewards.gold;
                }
                else {
                    character.inventory.currency.gold = miniGame.rewards.gold;
                }
            }
            if (miniGame.rewards.items && miniGame.rewards.items.length > 0) {
                if (!character.inventory.items) {
                    character.inventory.items = [];
                }
                for (const rewardItem of miniGame.rewards.items) {
                    const existingItem = character.inventory.items.find((item) => item.id === rewardItem.id || item.name === rewardItem.name);
                    if (existingItem) {
                        existingItem.quantity += rewardItem.quantity;
                    }
                    else {
                        character.inventory.items.push({
                            id: rewardItem.id,
                            name: rewardItem.name,
                            description: `Reward from ${miniGame.name}`,
                            quantity: rewardItem.quantity,
                            type: 'reward',
                            value: 0,
                        });
                    }
                }
            }
            if (miniGame.rewards.skills && miniGame.rewards.skills.length > 0) {
                for (const skillReward of miniGame.rewards.skills) {
                    if (character.skills) {
                        const skill = character.skills.find((s) => s.id === skillReward.id);
                        if (skill) {
                            skill.experience += skillReward.experience;
                            if (skill.experience >= skill.experienceToNextLevel) {
                                await this.handleSkillLevelUp(character, skill);
                            }
                        }
                    }
                }
            }
            if (miniGame.rewards.traits) {
                for (const [traitName, value] of Object.entries(miniGame.rewards.traits)) {
                    if (character.traits && traitName in character.traits) {
                        const currentValue = character.traits[traitName] || 0;
                        character.traits[traitName] = currentValue + value;
                        character.traits[traitName] = Math.max(0, Math.min(100, character.traits[traitName] || 0));
                    }
                }
            }
            await this.characterRepository.save(character);
        }
        return { nextNodeId, rewards };
    }
    async handleLevelUp(character) {
        character.level += 1;
        character.experience -= character.experienceToNextLevel;
        character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5);
        character.skillPoints += 1;
        character.attributes.strength += 1;
        character.attributes.intelligence += 1;
        character.attributes.dexterity += 1;
        character.attributes.charisma += 1;
        character.attributes.health += 10;
        character.attributes.mana += 5;
    }
    async handleSkillLevelUp(character, skill) {
        if (skill.level < skill.maxLevel) {
            skill.level += 1;
            skill.experience -= skill.experienceToNextLevel;
            skill.experienceToNextLevel = Math.floor(skill.experienceToNextLevel * 1.3);
            if (skill.childSkillIds && skill.childSkillIds.length > 0) {
                for (const childSkillId of skill.childSkillIds) {
                    const childSkill = character.skills.find((s) => s.id === childSkillId);
                    if (childSkill && childSkill.requiredLevel && childSkill.requiredLevel <= skill.level) {
                        if (!character.skillIds.includes(childSkillId)) {
                            character.skillIds.push(childSkillId);
                        }
                    }
                }
            }
        }
    }
};
exports.MiniGameService = MiniGameService;
exports.MiniGameService = MiniGameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mini_game_entity_1.MiniGame)),
    __param(1, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __param(2, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(3, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MiniGameService);
//# sourceMappingURL=mini-game.service.js.map