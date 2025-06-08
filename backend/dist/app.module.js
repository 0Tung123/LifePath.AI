"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const mail_module_1 = require("./mail/mail.module");
const users_module_1 = require("./user/users.module");
const game_module_1 = require("./game/game.module");
const memory_module_1 = require("./memory/memory.module");
const ai_module_1 = require("./ai/ai.module");
const user_entity_1 = require("./user/entities/user.entity");
const password_reset_token_entity_1 = require("./auth/entities/password-reset-token.entity");
const character_entity_1 = require("./game/entities/character.entity");
const game_session_entity_1 = require("./game/entities/game-session.entity");
const story_node_entity_1 = require("./game/entities/story-node.entity");
const choice_entity_1 = require("./game/entities/choice.entity");
const quest_entity_1 = require("./game/entities/quest.entity");
const memory_record_entity_1 = require("./memory/entities/memory-record.entity");
const story_entity_1 = require("./ai/entities/story.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: parseInt(configService.get('DB_PORT', '5432'), 10),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_NAME', 'postgres'),
                    entities: [
                        user_entity_1.User,
                        password_reset_token_entity_1.PasswordResetToken,
                        character_entity_1.Character,
                        game_session_entity_1.GameSession,
                        story_node_entity_1.StoryNode,
                        choice_entity_1.Choice,
                        quest_entity_1.Quest,
                        memory_record_entity_1.MemoryRecord,
                        story_entity_1.Story,
                    ],
                    synchronize: true,
                    autoLoadEntities: true,
                    retryAttempts: 10,
                    retryDelay: 3000,
                    logging: configService.get('NODE_ENV') !== 'production',
                }),
            }),
            auth_module_1.AuthModule,
            mail_module_1.MailModule,
            users_module_1.UsersModule,
            memory_module_1.MemoryModule,
            game_module_1.GameModule,
            ai_module_1.AIModule,
            ai_module_1.AIModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map