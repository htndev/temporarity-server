import { AuthScope } from './../constants/auth.constant';

export interface OAuthProviderData {
  provider: AuthScope;
  email: string;
  profilePicture: string;
  id: string;
}
