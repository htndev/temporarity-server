import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfig } from './common/providers/config/app.config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });
  const config = app.get(AppConfig);
  app.setGlobalPrefix(config.apiVersion);

  app.enableCors({ allowedHeaders: config.allowedHeaders, origin: config.allowedDomains, credentials: true });
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());
  app.disable('x-powered-by');

  await app.listen(config.port);
  Logger.verbose(`Server launched: ${config.url}`);
}

bootstrap();
