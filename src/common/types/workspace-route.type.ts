import { WorkspaceRouteResponseType } from './workspace-route-response.type';
import { RequestValidationStrategy } from './../constants/routes.constant';
import { Boxed, Nullable } from './base.type';
import { WorkspaceRouteAuthorizationStrategy } from './workspace-route-authorization-strategy.type';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  ALL = 'ALL'
}

export enum Placeholder {
  Wildcard = '*',
  Param = ':',
  Word = 'word'
}

export type RouteResponseType = Nullable<string | Boxed<Record<string, any>>>;

export interface RouteTemplate {
  methods: HttpMethod[];

  path: string;

  response: RouteResponseType;

  responseType: WorkspaceRouteResponseType;

  status: number;

  authorization: {
    strategy: RequestValidationStrategy;
    payload: Nullable<WorkspaceRouteAuthorizationStrategy>;
  };
}
