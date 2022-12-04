import { Column, Entity } from 'typeorm';
import { RouteTemplate } from './../../types/workspace-route.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_routes_templates' })
export class WorkspaceRoutesTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column()
  keyword: string;

  @Column()
  description: string;

  @Column()
  routes: RouteTemplate[];
}
