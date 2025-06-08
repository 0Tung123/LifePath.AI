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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const prompt_service_1 = require("./prompt.service");
let GeminiService = class GeminiService {
    constructor(configService, promptService) {
        this.configService = configService;
        this.promptService = promptService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables');
        }
        this.generativeAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    async generateStory(type, userChoice) {
        try {
            const prompt = this.promptService.createPromptWithUserChoice(type, userChoice);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Error generating story with Gemini:', error);
            throw new Error(`Failed to generate story: ${error.message}`);
        }
    }
    async continueStory(type, previousContent, userChoice) {
        try {
            const prompt = `
${previousContent}

Người dùng đã chọn: "${userChoice}"

Tiếp tục câu chuyện dựa trên lựa chọn này, giữ nguyên phong cách và định dạng.
`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Error continuing story with Gemini:', error);
            throw new Error(`Failed to continue story: ${error.message}`);
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prompt_service_1.PromptService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map