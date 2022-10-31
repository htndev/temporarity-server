import { EntityRepository } from 'typeorm';
import { WorkspaceRouteResponse } from './../entities/workspace-route-response.entity';
import { BaseRepository } from './base.repository';

@EntityRepository(WorkspaceRouteResponse)
export class WorkspaceRouteResponseRepository extends BaseRepository<WorkspaceRouteResponse> {}
