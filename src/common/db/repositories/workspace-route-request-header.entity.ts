import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { WorkspaceRouteRequestHeader } from '../entities/workspace-route-request-header.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRouteRequestHeader)
export class WorkspaceRouteRequestHeaderRepository extends BaseRepository<WorkspaceRouteRequestHeader> {}
