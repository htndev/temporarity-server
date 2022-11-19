import { Injectable } from '@nestjs/common';
import { WorkspaceRouteRequestField } from '../entities/workspace-route-request-field.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceRouteRequestFieldRepository extends BaseRepository<WorkspaceRouteRequestField> {}
