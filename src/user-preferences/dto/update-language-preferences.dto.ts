import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLanguagePreferences {
  @IsString()
  @IsNotEmpty()
  language: string;
}
