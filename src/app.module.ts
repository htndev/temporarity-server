import { DatabaseConfig } from './common/providers/config/database.config';
import { NodeEnvironment } from './common/constants/environment.constant';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as LocalConfigModule } from './common/providers/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === NodeEnvironment.Production
    }),
    TypeOrmModule.forRootAsync({
      imports: [LocalConfigModule],
      inject: [DatabaseConfig],
      useFactory: ({
        type,
        url,
        synchronize,
        database,
        dbConnectionRetryAttempts: retryAttempts,
        logging
      }: DatabaseConfig) =>
        ({
          type,
          url,
          synchronize,
          database,
          logging,
          retryAttempts,
          entities: [`${__dirname}/common/db/entities/*.entity.{js,ts}`],
          useUnifiedTopology: true
        } as TypeOrmModuleOptions)
    }),
    AuthModule
  ],
  providers: [{ provide: APP_PIPE, useValue: new ValidationPipe() }]
})
export class AppModule {}
