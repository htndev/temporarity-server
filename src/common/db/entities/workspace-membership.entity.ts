import { Column, Entity } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_membership', synchronize: true })
export class WorkspaceMembership extends BaseEntity {
  @Column()
  workspaceId: ObjectID;

  @Column()
  userId: ObjectID;

  @Column()
  role: ObjectID;
}
