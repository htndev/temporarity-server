import { Role } from './../../constants/role.constant';
import { EntityRepository, ObjectID } from 'typeorm';
import { WorkspaceRole } from './../entities/workspace-role.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(WorkspaceRole)
export class WorkspaceRoleRepository extends BaseRepository<WorkspaceRole> {
  async getEditorRoleId(): Promise<ObjectID> {
    return this.getRoleId(Role.Editor);
  }

  async getOwnerRoleId(): Promise<ObjectID> {
    return this.getRoleId(Role.Owner);
  }

  private async getRoleId(userRole: Role): Promise<ObjectID> {
    const role = await this.findOne({ name: userRole });
    return role.id;
  }
}
