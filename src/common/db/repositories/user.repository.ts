import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { AuthScope } from './../../constants/auth.constant';
import { IdentityProvider } from './../entities/identity-provider.entity';
import { User } from './../entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(User)
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
}
