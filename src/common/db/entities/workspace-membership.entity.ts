import { Column, Entity, ObjectID } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_membership', synchronize: true })
export class WorkspaceMembership extends BaseEntity {
  @Column({ type: 'string' })
  public workspaceId: ObjectID;

  @Column({ type: 'string' })
  userId: ObjectID;

  @Column({ type: 'string' })
  role: ObjectID;
}
