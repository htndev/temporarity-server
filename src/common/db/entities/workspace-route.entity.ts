import { Column, Entity, Index } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_routes' })
export class WorkspaceRoute extends BaseEntity {
  @Column()
  @Index()
  workspaceId: ObjectID;

  @Column()
  @Index()
  path: string;

  @Column()
  @Index()
  pathPattern: RegExp;

  @Column({ type: 'array' })
  methods: ObjectID[];

  @Column()
  status: number;
}
