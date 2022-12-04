import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './common/providers/config/app.config';
import { SecurityConfig } from './common/providers/config/security.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const appConfig = app.get(AppConfig);
  const securityConfig = app.get(SecurityConfig);
  app.setGlobalPrefix(appConfig.apiVersion);
  app.enableCors({
    origin: appConfig.allowedDomains,
    allowedHeaders: appConfig.allowedHeaders,
    credentials: true
  });
  app.use(cookieParser(securityConfig.cookieSecret));
  app.use(helmet());
  app.use(compression());
  app.disable('x-powered-by');
  await app.listen(appConfig.port);
  Logger.verbose(`Server launched: ${appConfig.url}`);
}

bootstrap();
