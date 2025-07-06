import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific origin for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  });

  // Apply global interceptors and filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('LifePath.AI API')
    .setDescription(
      'API for LifePath.AI game system, authentication, and user management',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('games', 'Game management endpoints')
    .addTag('user', 'User management endpoints')
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

  // Use port from environment variable or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api`,
  );
}
bootstrap();
