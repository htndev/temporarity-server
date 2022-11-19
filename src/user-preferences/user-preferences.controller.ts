import { JwtAccessTokenGuard } from './../common/guards/jwt-access-token.guard';
import { Controller, UseGuards } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('user-preferences')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  updateGeneralPreferences() {}
}
