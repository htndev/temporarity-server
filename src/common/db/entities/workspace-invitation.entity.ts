import { Column, Entity, Index, ObjectID } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_invitations' })
export class WorkspaceInvitation extends BaseEntity {
  @Column({ unique: true })
  @Index()
  inviteCode: string;

  @Column({ type: 'string' })
  userId: ObjectID;

  @Column({ type: 'string' })
  workspaceId: ObjectID;
}
