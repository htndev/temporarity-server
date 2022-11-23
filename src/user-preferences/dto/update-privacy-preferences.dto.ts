import { PASSWORD_REGEX } from '../../common/constants/regex.constant';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePrivacyPreferences {
  @IsString()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  newPasswordConfirmation: string;
}
