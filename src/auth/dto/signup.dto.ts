import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { FULL_NAME_REGEX, PASSWORD_REGEX } from '../../common/constants/regex.constant';

export class CredentialsSignUpDto {
  @IsNotEmpty()
  @Matches(FULL_NAME_REGEX, { message: 'Name could include only letters and spaces' })
  fullName: string;

  @IsNotEmpty()
  @IsEmail({ allow_ip_domain: false })
  email: string;

  @IsNotEmpty()
  @Length(8, 255)
  @Matches(PASSWORD_REGEX, {
    message: ({ value }) =>
      `Password should be at least 8 symbols, should not exceed 255 symbols, include at least one digit and special symbol, but received ${value}`
  })
  password: string;

  @IsString()
  language: string;
}
