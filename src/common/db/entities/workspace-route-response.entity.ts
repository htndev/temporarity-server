import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { ContentType, Nullable } from '../../types/base.type';
import { WorkspaceRouteResponseType } from '../../types/workspace-route-response.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_response' })
export class WorkspaceRouteResponse extends BaseEntity {
  @ObjectIdColumn()
  routeId: ObjectID | string;

  @Column({ enum: WorkspaceRouteResponseType })
  responseType: WorkspaceRouteResponseType;

  @Column({ nullable: true })
  schema: Nullable<ContentType>;
}
