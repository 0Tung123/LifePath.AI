import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thiết lập Gemini API key từ environment
  const configService = app.get(ConfigService);
  const geminiApiKey = configService.get<string>('GEMINI_API_KEY');

  if (!geminiApiKey) {
    console.warn(
      'GEMINI_API_KEY không được thiết lập. Các tính năng AI có thể không hoạt động.',
    );
    // Tạo biến môi trường tạm thời nếu không có
    process.env.GEMINI_API_KEY = 'AIzaSyAz2MkM7Osi-J0XnlsKAw9mA8b2MdP7HXg'; // API key tạm thời, thay thế bằng key thật
  }

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('RPG Game AI API')
    .setDescription(
      'API for authentication, game management, dynamic quests, and AI-driven game world',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api`,
  );
}
bootstrap();
