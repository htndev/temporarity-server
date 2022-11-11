import { IdentityProvider } from './../common/db/entities/identity-provider.entity';
import { User } from './../common/db/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provideCustomRepository } from '../common/utils/db.util';
import { UserRepository } from '../common/db/repositories/user.repository';
import { CommonModule } from './../common/common.module';
import { IdentityProviderRepository } from './../common/db/repositories/identity-provider.repository';
import { ConfigModule } from './../common/providers/config/config.module';
import { TokenModule } from './../common/providers/token/token.module';
import { FacebookStrategy } from './../strategies/facebook.strategy';
import { GithubStrategy } from './../strategies/github.strategy';
import { GoogleStrategy } from './../strategies/google.strategy';
import { JwtAccessTokenStrategy } from './../strategies/jwt-access.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, IdentityProvider]), ConfigModule, HttpModule, CommonModule, TokenModule],
  providers: [
    AuthService,
    FacebookStrategy,
    GoogleStrategy,
    GithubStrategy,
    JwtAccessTokenStrategy,
    provideCustomRepository(User, UserRepository),
    provideCustomRepository(IdentityProvider, IdentityProviderRepository)
  ],
  controllers: [AuthController]
})
export class AuthModule {}
