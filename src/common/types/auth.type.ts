import { User } from '../db/entities/user.entity';
import { AuthScope } from './../constants/auth.constant';

export interface OAuthProviderData {
  provider: AuthScope;
  email: string;
  profilePicture: string;
  fullName: string;
  id: string;
}

export type SafeUser = Pick<User, 'id' | 'email' | 'fullName' | 'profilePicture'>;
