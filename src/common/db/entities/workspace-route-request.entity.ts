import { Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_requests' })
export class WorkspaceRouteRequest extends BaseEntity {
  @ObjectIdColumn()
  routeId: ObjectID | string;
}
