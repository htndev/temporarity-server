import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './common/providers/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfig);

  await app.listen(config.port);
  Logger.verbose(`Server launched on port: ${config.port}`);
}

bootstrap();
