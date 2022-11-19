import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_response_headers' })
export class WorkspaceRouteResponseHeader extends BaseEntity {
  @ObjectIdColumn()
  routeRequestId: ObjectID | string;

  @Column()
  header: string;

  @Column()
  value: any;
}
