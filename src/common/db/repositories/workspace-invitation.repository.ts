import { EntityRepository } from 'typeorm';
import { v4 } from 'uuid';
import { WorkspaceInvitation } from './../entities/workspace-invitation.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(WorkspaceInvitation)
export class WorkspaceInvitationRepository extends BaseRepository<WorkspaceInvitation> {
  async generateInviteCode(): Promise<string> {
    const id = v4();

    return (await this.isExists({ inviteCode: id })) ? this.generateInviteCode() : id;
  }
}
