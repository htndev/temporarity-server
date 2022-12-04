import { Column, Entity, ObjectID } from 'typeorm';
import { RequestValidationStrategy } from './../../constants/routes.constant';
import { Nullable } from './../../types/base.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'workspace_route_authorization' })
export class WorkspaceRouteAuthorization extends BaseEntity {
  @Column({ enum: RequestValidationStrategy })
  strategy: RequestValidationStrategy;

  @Column({ nullable: true, default: null })
  payload: Nullable<Record<string, any>>;

  @Column({ type: 'string' })
  routeId: ObjectID;
}
