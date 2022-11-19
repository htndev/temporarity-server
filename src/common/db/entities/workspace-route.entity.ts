import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';
import { HttpMethod } from './../../types/workspace-route.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_routes' })
export class WorkspaceRoute extends BaseEntity {
  @ObjectIdColumn()
  workspaceId: ObjectID | string;

  @Column()
  @Index()
  path: string;

  @Column()
  @Index()
  pathPattern: RegExp;

  @Column({ type: 'array' })
  methods: HttpMethod[];

  @Column()
  status: number;
}
