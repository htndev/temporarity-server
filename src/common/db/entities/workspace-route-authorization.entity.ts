import { Column, Entity, ObjectID } from 'typeorm';
import { RequestValidationStrategy } from './../../constants/routes.constant';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_authorization' })
export class WorkspaceRouteAuthorization extends BaseEntity {
  @Column({ enum: RequestValidationStrategy })
  strategy: RequestValidationStrategy;

  @Column({ nullable: true, default: null })
  payload: null | Record<string, any>;

  @Column({ type: 'string' })
  routeId: ObjectID;
}
