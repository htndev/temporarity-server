export interface JwtPayload {
  email: string;
  fullName: string;
}

export enum Token {
  Refresh = 'refresh',
  Access = 'access'
}
