import { Column, Entity, Index, ObjectID } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_routes' })
export class WorkspaceRoute extends BaseEntity {
  @Column()
  @Index()
  workspaceId: string;

  @Column()
  @Index()
  path: string;

  @Column({ type: 'array' })
  methods: ObjectID[];

  @Column()
  status: number;
}
