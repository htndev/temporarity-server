import { FULL_NAME_REGEX } from '../../common/constants/regex.constant';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateGeneralPreferencesDto {
  @IsString()
  @IsNotEmpty()
  @Matches(FULL_NAME_REGEX, { message: 'Name could include only letters and spaces' })
  fullName: string;

  @IsString()
  @IsEmail({ allow_ip_domain: false })
  email: string;
}
