import { IsEnum } from 'class-validator';
import { WorkspaceRouteResponseType } from '../../common/types/workspace-route-response.type';
import { Boxed } from './../../common/types/base.type';

export class UpdateRouteResponseDto {
  @IsEnum(WorkspaceRouteResponseType)
  responseType: WorkspaceRouteResponseType;

  response: null | Boxed<Record<string, unknown>> | string | File;
}
