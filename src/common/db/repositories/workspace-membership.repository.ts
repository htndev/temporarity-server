import { Injectable } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { WorkspaceMembership } from '../entities/workspace-membership.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceMembershipRepository extends BaseRepository<WorkspaceMembership> {
  async getUserMembership(workspaceId: ObjectID | string, userId: ObjectID | string): Promise<WorkspaceMembership> {
    return this.findOne({ where: { workspaceId, userId } });
  }
}
