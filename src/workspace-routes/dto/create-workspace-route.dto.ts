import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HttpMethod } from '../../common/types/workspace-route.type';
import { Boxed, Nullable } from '../../common/types/base.type';
import { WorkspaceRouteResponseType } from '../../common/types/workspace-route-response.type';

export class CreateWorkspaceRouteDto {
  @IsNotEmpty()
  @IsString()
  readonly path: string;

  @IsArray()
  readonly methods: HttpMethod[];

  @IsNotEmpty()
  readonly status: number;

  @IsEnum(WorkspaceRouteResponseType)
  readonly responseType: WorkspaceRouteResponseType;

  @IsOptional()
  response: Nullable<Boxed<Record<string, unknown>> | File | string>;
}
