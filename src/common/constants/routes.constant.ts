import { HttpMethod } from './../types/workspace-route.type';

export const ALLOWED_HTTP_METHODS = [
  HttpMethod.GET,
  HttpMethod.POST,
  HttpMethod.PUT,
  HttpMethod.DELETE,
  HttpMethod.PATCH,
  HttpMethod.OPTIONS,
  HttpMethod.HEAD
];

export const ROUTE_SEPARATOR = '/';
