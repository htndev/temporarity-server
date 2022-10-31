import { ObjectID } from 'mongodb';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_requests' })
export class WorkspaceRouteRequest extends BaseEntity {
  @Column()
  routeId: ObjectID;
}
