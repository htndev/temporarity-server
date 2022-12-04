import { WorkspaceTemplate } from './../../common/constants/workspace.constant';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsEnum(WorkspaceTemplate)
  template: string;
}
