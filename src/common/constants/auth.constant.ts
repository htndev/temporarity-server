export enum AuthScope {
  Facebook = 'facebook',
  Google = 'google',
  Github = 'github'
}

export const CALLBACK_PATH = 'callback';

export enum JwtStrategy {
  Access = 'jwt-at',
  Refresh = 'jwt-rt'
}
