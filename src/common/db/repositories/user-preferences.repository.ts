import { Injectable } from '@nestjs/common';
import { UserPreferences } from '../entities/user-preferences.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserPreferencesRepository extends BaseRepository<UserPreferences> {}
