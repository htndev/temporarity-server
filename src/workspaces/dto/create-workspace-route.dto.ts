import { HttpMethod } from './../../common/types/workspace-route.type';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWorkspaceRouteDto {
  @IsNotEmpty()
  @IsString()
  path: string;

  @IsArray()
  httpMethods: HttpMethod[];

  @IsNotEmpty()
  @IsNumber()
  status: number;
}
