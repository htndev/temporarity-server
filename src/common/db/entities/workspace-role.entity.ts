import { Column, Entity, Index } from 'typeorm';
import { Role } from './../../constants/role.constant';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_role' })
export class WorkspaceRole extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name: Role;
}
