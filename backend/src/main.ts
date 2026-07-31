import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
];

const getCorsOrigins = () => {
  const origins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : DEFAULT_CORS_ORIGINS;
};

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
    origin: getCorsOrigins(),
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;

  await app.listen(port, '0.0.0.0');
  console.log(`Kivis backend listening on port ${port}`);
}

bootstrap();
