import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    {
      rawBody: true,
    },
  );

  // ==========================================
  // GLOBAL VALIDATION
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ==========================================
  // CORS
  // ==========================================
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
  });

  await app.listen(3001, '0.0.0.0');
}

bootstrap();