import { EmailConfig } from './email.config';
import { Module } from '@nestjs/common';
import { AppConfig, DatabaseConfig, SecurityConfig } from './index';

const CONFIGS = [AppConfig, DatabaseConfig, SecurityConfig, EmailConfig];

@Module({
  providers: CONFIGS,
  exports: CONFIGS
})
export class ConfigModule {}
