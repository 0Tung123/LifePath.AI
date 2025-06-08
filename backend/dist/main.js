"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const geminiApiKey = configService.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
        console.warn('GEMINI_API_KEY không được thiết lập. Các tính năng AI có thể không hoạt động.');
        process.env.GEMINI_API_KEY = 'AIzaSyAz2MkM7Osi-J0XnlsKAw9mA8b2MdP7HXg';
    }
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('RPG Game AI API')
        .setDescription('API for authentication, game management, dynamic quests, and AI-driven game world')
        .setVersion('1.0')
        .addTag('auth', 'Authentication endpoints')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation is available at: ${await app.getUrl()}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map