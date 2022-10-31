import { ObjectID } from 'mongodb';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_request_headers' })
export class WorkspaceRouteRequestHeader extends BaseEntity {
  @Column()
  routeRequestId: ObjectID;

  @Column()
  header: string;

  @Column()
  value: string;
}
