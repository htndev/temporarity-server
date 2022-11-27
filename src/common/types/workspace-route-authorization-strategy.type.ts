enum JwtCondition {
  BePresented = 'be-presented',
  NotExpired = 'not-expired',
  BeValid = 'be-valid',
  Equals = 'equals'
}

interface BePresentedConfig {
  condition: JwtCondition.BePresented;
  payload: { token: string };
}

interface NotExpiredConfig {
  condition: JwtCondition.NotExpired;
  payload: { token: string };
}

interface BeValidConfig {
  condition: JwtCondition.BeValid;
  payload: { token: string; signature: string };
}

interface EqualsConfig {
  condition: JwtCondition.Equals;
  payload: { token: string; value: string };
}

export type JwtStrategyConfig = BePresentedConfig | NotExpiredConfig | BeValidConfig | EqualsConfig;

export interface ApiKeyConfig {
  apiKeyQueryParam: string;
  apiKey: string;
}
