import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provideCustomRepository } from '../common/utils/db.util';
import { JwtAccessTokenStrategy } from '../strategies/jwt-access.strategy';
import { JwtRefreshTokenStrategy } from '../strategies/jwt-refresh.strategy';
import { User } from './db/entities/user.entity';
import { UserRepository } from './db/repositories/user.repository';
import { AppConfig } from './providers/config/app.config';
import { ConfigModule } from './providers/config/config.module';
import { SecurityConfig } from './providers/config/security.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [SecurityConfig, AppConfig],
      useFactory: (
        { jwtAccessTokenSecret: secret, jwtAccessTokenExpiresIn: expiresIn }: SecurityConfig,
        { appHostname: issuer }: AppConfig
      ) => ({
        secret,
        signOptions: {
          expiresIn,
          issuer
        }
      })
    }),
    ConfigModule
  ],
  providers: [
    PassportModule,
    JwtModule,
    ConfigModule,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    provideCustomRepository(User, UserRepository)
  ],
  exports: [PassportModule, JwtModule, ConfigModule, JwtAccessTokenStrategy, JwtRefreshTokenStrategy]
})
export class CommonModule {}
