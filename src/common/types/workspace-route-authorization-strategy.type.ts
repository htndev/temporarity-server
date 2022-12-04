export enum JwtCondition {
  BePresented = 'be-presented',
  NotExpired = 'not-expired',
  BeValid = 'be-valid',
  Equals = 'equals'
}

interface BePresentedConfig {
  condition: JwtCondition.BePresented;
  payload?: null;
}

interface NotExpiredConfig {
  condition: JwtCondition.NotExpired;
  payload?: null;
}

interface BeValidConfig {
  condition: JwtCondition.BeValid;
  payload: { signature: string };
}

interface EqualsConfig {
  condition: JwtCondition.Equals;
  payload: { value: string };
}

export type JwtStrategyConfig = BePresentedConfig | NotExpiredConfig | BeValidConfig | EqualsConfig;

export interface ApiKeyConfig {
  apiKeyQueryParam: string;
  apiKey: string;
}

export type WorkspaceRouteAuthorizationStrategy = JwtStrategyConfig | ApiKeyConfig;
