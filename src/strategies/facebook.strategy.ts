import { Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { map } from 'rxjs';
import { AuthScope, CALLBACK_PATH } from '../common/constants/auth.constant';
import { AppConfig } from '../common/providers/config/app.config';
import { SecurityConfig } from '../common/providers/config/security.config';
import { OAuthProviderData } from '../common/types/auth.type';

export class FacebookStrategy extends PassportStrategy(Strategy, AuthScope.Facebook) {
  facebookGraphUrl = 'https://graph.facebook.com/v12.0';

  constructor(
    @Inject(SecurityConfig)
    { appId: { [AuthScope.Facebook]: clientID }, secret: { [AuthScope.Facebook]: clientSecret } }: SecurityConfig,
    @Inject(AppConfig) { clientUrl, url }: AppConfig,
    private readonly httpService: HttpService
  ) {
    super({
      clientID,
      clientSecret,
      callbackURL: `${url}/auth/${AuthScope.Facebook}/${CALLBACK_PATH}`,
      failureRedirect: `${clientUrl}/login`,
      scope: 'email',
      profileFields: ['emails', 'name']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    { id, displayName: fullName, emails: [{ value: email }] }: Profile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<void> {
    const profilePicture = await this.getProfileImage({ id, accessToken });

    const payload: OAuthProviderData = {
      id,
      provider: AuthScope.Facebook,
      email,
      fullName,
      profilePicture
    };

    done(null, payload);
  }

  async getProfileImage({ id, accessToken }: { id: number | string; accessToken: string }): Promise<string> {
    const sendRequest = (): Promise<{ height: number; url: string; width: number }> =>
      new Promise((resolve, reject) =>
        this.httpService
          .get(`${this.facebookGraphUrl}/${id}/picture`, {
            params: { access_token: accessToken, width: 200, height: 200, redirect: false }
          })
          .pipe(map((v) => v.data.data))
          .subscribe({ next: resolve, error: reject })
      );
    const { url } = await sendRequest();

    return url;
  }
}
