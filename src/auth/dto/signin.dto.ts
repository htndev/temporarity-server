import { IsNotEmpty } from 'class-validator';

export class CredentialsSignInDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
