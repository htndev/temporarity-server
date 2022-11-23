import { transformObjectId } from '../../utils/db.util';
import { Injectable } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { Role } from '../../constants/role.constant';
import { WorkspaceRole } from '../entities/workspace-role.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceRoleRepository extends BaseRepository<WorkspaceRole> {
  async getRoleById(roleId: ObjectID) {
    return this.findOne({ where: { _id: transformObjectId(roleId) } });
  }

  async getEditorRoleId(): Promise<ObjectID> {
    return this.getRoleId(Role.Editor);
  }

  async getOwnerRoleId(): Promise<ObjectID> {
    return this.getRoleId(Role.Owner);
  }

  private async getRoleId(userRole: Role): Promise<ObjectID> {
    const role = await this.findOne({ where: { name: userRole } });

    return role._id;
  }
}
