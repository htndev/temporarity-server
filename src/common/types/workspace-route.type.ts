import { Boxed, Nullable } from './base.type';

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
