import { HttpStatus } from '@nestjs/common';
import { IsNumber } from 'class-validator';

export class UpdateRouteStatusDto {
  @IsNumber()
  status: HttpStatus | number;
}
