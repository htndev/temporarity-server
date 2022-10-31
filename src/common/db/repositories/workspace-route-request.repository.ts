import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { WorkspaceRouteRequest } from '../entities/workspace-route-request.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRouteRequest)
export class WorkspaceRouteRequestRepository extends BaseRepository<WorkspaceRouteRequest> {}
