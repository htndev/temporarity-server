import { HttpStatus, Injectable } from '@nestjs/common';
import { UserPreferencesRepository } from './../common/db/repositories/user-preferences.repository';

@Injectable()
export class UserPreferencesService {
  constructor(private readonly userPreferencesRepository: UserPreferencesRepository) {}

  async updateGeneralPreferences() {
    return {
      status: HttpStatus.ACCEPTED
    };
  }
}
