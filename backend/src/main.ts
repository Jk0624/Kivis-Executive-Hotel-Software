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
  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
  });

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port, '0.0.0.0');
}

bootstrap();