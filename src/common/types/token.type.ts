export interface JwtPayload {
  email: string;
  fullName: string;
}

export enum TokenType {
  Refresh = 'refresh',
  Access = 'access'
}
