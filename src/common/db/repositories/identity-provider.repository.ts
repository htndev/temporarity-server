import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdentityProvider } from '../entities/identity-provider.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(IdentityProvider)
export class IdentityProviderRepository extends BaseRepository<IdentityProvider> {}
