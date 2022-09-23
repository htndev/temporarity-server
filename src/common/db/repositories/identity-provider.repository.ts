import { User } from './../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdentityProvider } from '../entities/identity-provider.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(IdentityProvider)
export class IdentityProviderRepository extends BaseRepository<IdentityProvider> {
  async getIdentityProviderByUser(user: User): Promise<IdentityProvider['provider'] | null> {
    const identityProvider = await this.findOne({ userId: user.id });

    return identityProvider?.provider;
  }
}
