import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, TokenType } from './../../types/token.type';
import { SecurityConfig } from './../config/security.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService, private readonly securityConfig: SecurityConfig) {}

  async generateTokens(payload: JwtPayload): Promise<{ [k in TokenType]: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.securityConfig.jwtAccessTokenSecret,
      expiresIn: this.securityConfig.jwtAccessTokenExpiresIn
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.securityConfig.jwtRefreshTokenSecret,
      expiresIn: this.securityConfig.jwtRefreshTokenExpiresIn
    });

    return {
      [TokenType.Access]: accessToken,
      [TokenType.Refresh]: refreshToken
    };
  }
}
