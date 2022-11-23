import { Body, Controller, Get, Patch, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { User } from '../common/decorators/user.decorator';
import { JwtAccessTokenGuard } from '../common/guards/jwt-access-token.guard';
import { SafeUser } from '../common/types/auth.type';
import { UpdateGeneralPreferencesDto } from './dto/update-general-preferences.dto';
import { UpdateLanguagePreferences } from './dto/update-language-preferences.dto';
import { UpdatePrivacyPreferences } from './dto/update-privacy-preferences.dto';
import { UserPreferencesService } from './user-preferences.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('user-preferences')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  getUserPreferences(@User() user: SafeUser) {
    return this.userPreferencesService.getUserPreferences(user);
  }

  @Patch('general')
  async updateGeneralPreferences(
    @Body() updateGeneralPreferences: UpdateGeneralPreferencesDto,
    @User() user: SafeUser,
    @Res() response: Response
  ) {
    return response.send(
      await this.userPreferencesService.updateGeneralPreferences(updateGeneralPreferences, user, response)
    );
  }

  @Patch('privacy')
  updatePrivacyPreferences(@Body() updatePrivacyPreferences: UpdatePrivacyPreferences, @User() user: SafeUser) {
    return this.userPreferencesService.updatePrivacyPreferences(updatePrivacyPreferences, user);
  }

  @Patch('language')
  updateLanguagePreferences(@Body() updateLanguagePreferences: UpdateLanguagePreferences, @User() user: SafeUser) {
    return this.userPreferencesService.updateLanguagePreferences(updateLanguagePreferences, user);
  }
}
