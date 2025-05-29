import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerDocument from './swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('My Fullstack API')
    .setDescription('API for the fullstack application')
    .setVersion('1.0')
    .build();
  //const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    swaggerOptions: {
      validatorUrl: null,
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
