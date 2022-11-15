import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoutePathDto {
  @IsString()
  @IsNotEmpty()
  path: string;
}
