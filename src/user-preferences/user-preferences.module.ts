import { UserPreferences } from './../common/db/entities/user-preferences.entity';
import { provideCustomRepository } from '../common/utils/db.util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesRepository } from './../common/db/repositories/user-preferences.repository';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferences])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, provideCustomRepository(UserPreferences, UserPreferencesRepository)]
})
export class UserPreferencesModule {}
