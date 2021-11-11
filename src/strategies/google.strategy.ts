import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthScope, CALLBACK_PATH } from './../common/constants/auth.constant';
import { AppConfig } from './../common/providers/config/app.config';
import { SecurityConfig } from './../common/providers/config/security.config';
import { OAuthProviderData } from './../common/types/auth.type';

export class GoogleStrategy extends PassportStrategy(Strategy, AuthScope.Google) {
  constructor(
    @Inject(SecurityConfig)
    { appId: { [AuthScope.Google]: clientID }, secret: { [AuthScope.Google]: clientSecret } }: SecurityConfig,
    @Inject(AppConfig) { url }: AppConfig,
  ) {
    super({
      clientID,
      clientSecret,
      callbackURL: `${url}/auth/${AuthScope.Google}/${CALLBACK_PATH}`,
      scope: ['email', 'profile']
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    { id, emails: [{ value: email }], photos: [{ value: profilePicture }] }: Profile,
    done: VerifyCallback
  ): void {
    const payload: OAuthProviderData = {
      id,
      provider: AuthScope.Google,
      email,
      profilePicture
    };

    done(null, payload);
  }
}
