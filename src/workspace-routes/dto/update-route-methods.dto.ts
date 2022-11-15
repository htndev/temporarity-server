import { IsArray } from 'class-validator';
import { HttpMethod } from './../../common/types/workspace-route.type';

export class UpdateRouteMethodsDto {
  @IsArray()
  methods: HttpMethod[];
}
