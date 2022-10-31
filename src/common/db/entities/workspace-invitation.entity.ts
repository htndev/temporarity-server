import { ObjectID } from 'mongodb';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_invitations' })
export class WorkspaceInvitation extends BaseEntity {
  @Column({ unique: true })
  @Index()
  inviteCode: string;

  @Column()
  userId: ObjectID;

  @Column()
  workspaceId: ObjectID;
}
