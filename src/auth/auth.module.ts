import { JwtAccessTokenStrategy } from './../strategies/jwt-access.strategy';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../common/db/repositories/user.repository';
import { CommonModule } from './../common/common.module';
import { IdentityProviderRepository } from './../common/db/repositories/identity-provider.repository';
import { ConfigModule } from './../common/providers/config/config.module';
import { TokenModule } from './../common/providers/token/token.module';
import { FacebookStrategy } from './../strategies/facebook.strategy';
import { GithubStrategy } from './../strategies/github.strategy';
import { GoogleStrategy } from './../strategies/google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, IdentityProviderRepository]),
    ConfigModule,
    HttpModule,
    CommonModule,
    TokenModule
  ],
  providers: [AuthService, FacebookStrategy, GoogleStrategy, GithubStrategy, JwtAccessTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
