import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtPayload, Token } from '../../types/token.type';
import { SecurityConfig } from '../config/security.config';
import { MILLISECOND } from '../../constants/time.constant';
import { CookiesType } from '../../types/base.type';
import { AppConfig } from '../config/app.config';

type TokensObject = { [k in Token]: string };
type TokenType = { tokens: TokensObject };

@Injectable()
export class TokenService {
  private readonly tokenCookiePrefix = 'token.';

  constructor(
    private readonly jwtService: JwtService,
    private readonly securityConfig: SecurityConfig,
    private readonly appConfig: AppConfig
  ) {}

  get tokenExpire(): { [token in Token]: Date } {
    return {
      [Token.Access]: new Date(Date.now() + this.securityConfig.jwtAccessTokenExpiresIn * MILLISECOND),
      [Token.Refresh]: new Date(Date.now() + this.securityConfig.jwtRefreshTokenExpiresIn * MILLISECOND)
    };
  }

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

  setTokens(tokens: TokensObject, response: Response) {
    Object.entries(tokens).forEach(([key, value]) =>
      response.cookie(`${this.tokenCookiePrefix}${key}`, value, {
        httpOnly: true,
        expires: this.tokenExpire[key],
        signed: true,
        sameSite: 'none',
        secure: true,
        domain: this.appConfig.appHostname
      })
    );
  }

  getTokensFromCookies(cookies: CookiesType): TokensObject {
    return {
      [Token.Access]: cookies[`${this.tokenCookiePrefix}${Token.Access}`] as string,
      [Token.Refresh]: cookies[`${this.tokenCookiePrefix}${Token.Refresh}`] as string
    };
  }

  deleteCookies(response: Response) {
    [Token.Access, Token.Refresh].forEach((token) => response.clearCookie(`${this.tokenCookiePrefix}${token}`));
  }
}
