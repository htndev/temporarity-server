import { WorkspaceRouteRequestFieldType } from './../../types/workspace-route-request.type';
import { ObjectID } from 'mongodb';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_request_fields' })
export class WorkspaceRouteRequestField extends BaseEntity {
  @Column()
  routeRequestId: ObjectID;

  @Column()
  field: string;

  @Column({ enum: WorkspaceRouteRequestFieldType })
  type: WorkspaceRouteRequestFieldType;

  @Column({ default: false })
  required: boolean;
}
