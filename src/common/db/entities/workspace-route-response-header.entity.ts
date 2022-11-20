import { Column, Entity, ObjectID } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_response_headers' })
export class WorkspaceRouteResponseHeader extends BaseEntity {
  @Column({ type: 'string' })
  routeRequestId: ObjectID;

  @Column()
  header: string;

  @Column()
  value: any;
}
