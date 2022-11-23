import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { UserPreferences } from '../entities/user-preferences.entity';
import { Preferences } from '../../types/auth.type';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserPreferencesRepository extends BaseRepository<UserPreferences> {
  async getUserPreferences(userId: ObjectID): Promise<Preferences> {
    const preferences = await this.findOne({ where: { userId } });

    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    return {
      language: preferences.language
    };
  }
}
