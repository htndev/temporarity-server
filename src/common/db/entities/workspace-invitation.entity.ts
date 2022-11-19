import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_invitations' })
export class WorkspaceInvitation extends BaseEntity {
  @Column({ unique: true })
  @Index()
  inviteCode: string;

  @ObjectIdColumn()
  userId: ObjectID | string;

  @ObjectIdColumn()
  workspaceId: ObjectID | string;
}
