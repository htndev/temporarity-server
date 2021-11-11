import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { AuthScope, CALLBACK_PATH } from './../common/constants/auth.constant';
import { AppConfig } from './../common/providers/config/app.config';
import { SecurityConfig } from './../common/providers/config/security.config';
import { OAuthProviderData } from './../common/types/auth.type';

export class GithubStrategy extends PassportStrategy(Strategy, AuthScope.Github) {
  constructor(
    @Inject(SecurityConfig)
    { appId: { [AuthScope.Github]: clientID }, secret: { [AuthScope.Github]: clientSecret } }: SecurityConfig,
    @Inject(AppConfig) { url }: AppConfig
  ) {
    super({
      clientID,
      clientSecret,
      callbackURL: `${url}/auth/${AuthScope.Github}/${CALLBACK_PATH}`
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    { id, photos: [{ value: profilePicture }], emails: [{ value: email }] = [{ value: null }] }: Profile,
    // profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ): void {
    const payload: OAuthProviderData = {
      id,
      email,
      profilePicture,
      provider: AuthScope.Github
    };

    done(null, payload);
  }
}
