import { EntityRepository } from 'typeorm';
import { WorkspaceMembership } from '../entities/workspace-membership.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(WorkspaceMembership)
export class WorkspaceMembershipRepository extends BaseRepository<WorkspaceMembership> {}
