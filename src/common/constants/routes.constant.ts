import { HttpMethod } from '../types/workspace-route.type';

export const ALLOWED_HTTP_METHODS = [
  HttpMethod.GET,
  HttpMethod.POST,
  HttpMethod.PUT,
  HttpMethod.DELETE,
  HttpMethod.PATCH,
  HttpMethod.OPTIONS,
  HttpMethod.HEAD
];

export enum RequestValidationStrategy {
  NONE = 'none',
  JWT = 'jwt',
  API_KEY = 'api-key'
}

export const REQUEST_VALIDATION_STRATEGIES = Object.values(RequestValidationStrategy);

export const ROUTE_SEPARATOR = '/';
