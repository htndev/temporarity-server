import { Injectable } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { Role } from '../../constants/role.constant';
import { WorkspaceRole } from '../entities/workspace-role.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceRoleRepository extends BaseRepository<WorkspaceRole> {
  async getRoleById(roleId: ObjectID | string) {
    return this.findOne({ where: { id: roleId } });
  }

  async getEditorRoleId(): Promise<ObjectID | string> {
    return this.getRoleId(Role.Editor);
  }

  async getOwnerRoleId(): Promise<ObjectID | string> {
    return this.getRoleId(Role.Owner);
  }

  private async getRoleId(userRole: Role): Promise<ObjectID | string> {
    const role = await this.findOne({ where: { name: userRole } });

    return role.id;
  }
}
