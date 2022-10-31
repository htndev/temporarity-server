import { IsArray } from 'class-validator';

export class InviteUsersDto {
  @IsArray()
  emails: string[];
}
