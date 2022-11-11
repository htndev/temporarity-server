import { Injectable } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { WorkspaceMembership } from '../entities/workspace-membership.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceMembershipRepository extends BaseRepository<WorkspaceMembership> {
  async getUserMembership(workspaceId: ObjectID, userId: ObjectID): Promise<WorkspaceMembership> {
    return this.findOne({ where: { workspaceId, userId } });
  }
}
