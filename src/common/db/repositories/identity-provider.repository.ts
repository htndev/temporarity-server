import { Injectable } from '@nestjs/common';
import { IdentityProvider } from '../entities/identity-provider.entity';
import { User } from './../entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class IdentityProviderRepository extends BaseRepository<IdentityProvider> {
  async getIdentityProviderByUser(user: User): Promise<IdentityProvider['provider'] | null> {
    const identityProvider = await this.findOne({ where: { userId: user.id } });

    return identityProvider?.provider;
  }
}
