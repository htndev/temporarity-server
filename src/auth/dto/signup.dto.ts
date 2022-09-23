import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CredentialsSignUpDto {
  @IsNotEmpty()
  @Matches(/^([A-Za-zА-ЯҐЄІЇа-яґєії\.]+.?\s?){0,255}$/, { message: 'Name could include only letters and spaces' })
  fullName: string;

  @IsNotEmpty()
  @IsEmail({ allow_ip_domain: false })
  email: string;

  @IsNotEmpty()
  @Length(8, 255)
  @Matches(/^(?=.*[ -/:-@[-`{-~]+)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z]).{8,255}$/, {
    message: ({ value }) =>
      `Password should be at least 8 symbols, should not exceed 255 symbols, include at least one digit and special symbol, but received ${value}`
  })
  password: string;
}
