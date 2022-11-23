import { BadRequestException, ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { Response } from 'express';
import { SALT_ROUNDS } from '../common/constants/security.constant';
import { UserPreferencesRepository } from '../common/db/repositories/user-preferences.repository';
import { UserRepository } from '../common/db/repositories/user.repository';
import { TokenService } from '../common/providers/token/token.service';
import { SafeUser } from '../common/types/auth.type';
import { UpdateGeneralPreferencesDto } from './dto/update-general-preferences.dto';
import { UpdateLanguagePreferences } from './dto/update-language-preferences.dto';
import { UpdatePrivacyPreferences } from './dto/update-privacy-preferences.dto';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPreferencesRepository: UserPreferencesRepository,
    private readonly tokenService: TokenService
  ) {}

  async getUserPreferences(user: SafeUser) {
    const userId = await this.userRepository.retrieveId({ email: user.email });
    const preferences = await this.userPreferencesRepository.getUserPreferences(userId);

    return {
      status: HttpStatus.OK,
      preferences
    };
  }

  async updateGeneralPreferences(
    updateGeneralPreferences: UpdateGeneralPreferencesDto,
    user: SafeUser,
    response: Response
  ) {
    const userId = await this.userRepository.retrieveId({ email: updateGeneralPreferences.email });

    if (user.email !== updateGeneralPreferences.email && userId) {
      const userWithSameEmail = await this.userRepository.isExists({ email: updateGeneralPreferences.email });

      if (userWithSameEmail) {
        throw new ConflictException('User with same email already exists');
      }

      await this.userRepository.update({ _id: userId }, { email: updateGeneralPreferences.email });
    }

    if (user.fullName !== updateGeneralPreferences.fullName) {
      await this.userRepository.update({ _id: userId }, { fullName: updateGeneralPreferences.fullName });
    }

    const tokens = await this.tokenService.generateTokens(updateGeneralPreferences);

    this.tokenService.setTokens(tokens, response);

    return {
      status: HttpStatus.ACCEPTED,
      tokens
    };
  }

  async updatePrivacyPreferences(updatePrivacyPreferences: UpdatePrivacyPreferences, user: SafeUser) {
    const originalUser = await this.userRepository.findOne({ where: { email: user.email } });

    if (!originalUser) {
      throw new BadRequestException('User not found');
    }

    if (updatePrivacyPreferences.newPassword !== updatePrivacyPreferences.newPasswordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!(await originalUser.comparePassword(updatePrivacyPreferences.oldPassword))) {
      throw new BadRequestException('Old password is incorrect');
    }

    await this.userRepository.update(
      { _id: originalUser._id },
      { password: await hash(updatePrivacyPreferences.newPassword, SALT_ROUNDS) }
    );

    return {
      status: HttpStatus.ACCEPTED,
      message: 'Password updated successfully'
    };
  }

  async updateLanguagePreferences(updateLanguagePreferences: UpdateLanguagePreferences, user: SafeUser) {
    const userId = await this.userRepository.retrieveId({ email: user.email });
    await this.userPreferencesRepository.update({ userId: userId }, { language: updateLanguagePreferences.language });
    return {
      status: HttpStatus.ACCEPTED
    };
  }
}
