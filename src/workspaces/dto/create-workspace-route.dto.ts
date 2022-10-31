import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWorkspaceRouteDto {
  @IsNotEmpty()
  @IsString()
  path: string;

  @IsArray()
  httpMethods: number[];

  @IsNotEmpty()
  @IsNumber()
  status: number;
}
