import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { NodeEnvironment } from './common/constants/environment.constant';
import { ConfigModule as LocalConfigModule } from './common/providers/config/config.module';
import { DatabaseConfig } from './common/providers/config/database.config';
import { RequestLoggerMiddleware } from './middleware/logger.middleware';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { RoutesModule } from './routes/routes.module';

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
    AuthModule,
    CommonModule,
    WorkspacesModule,
    RoutesModule
  ],
  providers: [{ provide: APP_PIPE, useValue: new ValidationPipe() }]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
