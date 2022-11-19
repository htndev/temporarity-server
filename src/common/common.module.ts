import { provideCustomRepository } from 'src/common/utils/db.util';
import { User } from './db/entities/user.entity';
import { JwtRefreshTokenStrategy } from '../strategies/jwt-refresh.strategy';
import { JwtAccessTokenStrategy } from '../strategies/jwt-access.strategy';
import { UserRepository } from './db/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
