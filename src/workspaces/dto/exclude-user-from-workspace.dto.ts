import { IsEmail } from 'class-validator';

export class ExcludeUserFromWorkspaceDto {
  @IsEmail()
  email: string;
}
