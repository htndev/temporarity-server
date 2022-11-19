import { Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_membership', synchronize: true })
export class WorkspaceMembership extends BaseEntity {
  @ObjectIdColumn()
  workspaceId: ObjectID | string;

  @ObjectIdColumn()
  userId: ObjectID | string;

  @ObjectIdColumn()
  role: ObjectID | string;
}
