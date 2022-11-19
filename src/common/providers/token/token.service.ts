import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Token } from '../../types/token.type';
import { SecurityConfig } from '../config/security.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService, private readonly securityConfig: SecurityConfig) {}

  async generateTokens(payload: JwtPayload): Promise<{ [k in Token]: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.securityConfig.jwtAccessTokenSecret,
      expiresIn: `${this.securityConfig.jwtAccessTokenExpiresIn}s`
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.securityConfig.jwtRefreshTokenSecret,
      expiresIn: `${this.securityConfig.jwtRefreshTokenExpiresIn}s`
    });

    return {
      [Token.Access]: accessToken,
      [Token.Refresh]: refreshToken
    };
  }

  async generateTokensByRefreshToken(refreshToken: string): Promise<{ [k in Token]: string }> {
    const { email, fullName } = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.securityConfig.jwtRefreshTokenSecret
    });

    return this.generateTokens({ email, fullName });
  }
}
