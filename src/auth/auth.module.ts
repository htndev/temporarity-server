import { IdentityProviderRepository } from './../common/db/repositories/identity-provider.repository';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../common/db/repositories/user.repository';
import { ConfigModule } from './../common/providers/config/config.module';
import { FacebookStrategy } from './../strategies/facebook.strategy';
import { GithubStrategy } from './../strategies/github.strategy';
import { GoogleStrategy } from './../strategies/google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, IdentityProviderRepository]), ConfigModule, HttpModule],
  providers: [AuthService, FacebookStrategy, GoogleStrategy, GithubStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
