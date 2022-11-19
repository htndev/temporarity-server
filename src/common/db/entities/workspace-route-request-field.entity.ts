import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { WorkspaceRouteRequestFieldType } from '../../types/workspace-route-request.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_request_fields' })
export class WorkspaceRouteRequestField extends BaseEntity {
  @ObjectIdColumn()
  routeRequestId: ObjectID | string;

  @Column()
  field: string;

  @Column({ enum: WorkspaceRouteRequestFieldType })
  type: WorkspaceRouteRequestFieldType;

  @Column({ default: false })
  required: boolean;
}
