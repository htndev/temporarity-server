import { Injectable } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { AuthScope } from './../../constants/auth.constant';
import { SafeUser } from './../../types/auth.type';
import { Nullable } from './../../types/base.type';
import { IdentityProvider } from './../entities/identity-provider.entity';
import { User } from './../entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  async createOauthUser({
    email,
    profilePicture,
    provider,
    providerId,
    fullName
  }: {
    email: string;
    profilePicture: string;
    provider: AuthScope;
    providerId: string | number;
    fullName: string;
  }) {
    const user = this.create({ email, fullName, profilePicture, isOauthUser: true });
    await user.save();

    const identityProvider = new IdentityProvider();
    identityProvider.provider = provider;
    identityProvider.providerId = providerId;
    identityProvider.userId = user.id;
    await identityProvider.save();

    return user;
  }

  async safeFindUser({ email }: { email: string }): Promise<Nullable<SafeUser>> {
    const user = await this.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    return this.mapSecureFields(user);
  }

  async safeFindUsers(ids: (string | ObjectID)[]): Promise<SafeUser[]> {
    const users = await this.findByIds(ids);

    return users.map(this.mapSecureFields);
  }

  private mapSecureFields(user: User): SafeUser {
    return {
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture || null
    };
  }
}
