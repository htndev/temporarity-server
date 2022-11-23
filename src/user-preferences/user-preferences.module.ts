import { TokenModule } from '../common/providers/token/token.module';
import { ConfigModule } from '../common/providers/config/config.module';
import { UserRepository } from '../common/db/repositories/user.repository';
import { User } from '../common/db/entities/user.entity';
import { UserPreferences } from '../common/db/entities/user-preferences.entity';
import { provideCustomRepository } from '../common/utils/db.util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesRepository } from '../common/db/repositories/user-preferences.repository';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, UserPreferences]), TokenModule],
  controllers: [UserPreferencesController],
  providers: [
    UserPreferencesService,
    provideCustomRepository(User, UserRepository),
    provideCustomRepository(UserPreferences, UserPreferencesRepository)
  ]
})
export class UserPreferencesModule {}
