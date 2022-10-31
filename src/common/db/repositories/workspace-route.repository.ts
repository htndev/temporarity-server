import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { WorkspaceRoute } from './../entities/workspace-route.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRoute)
export class WorkspaceRouteRepository extends BaseRepository<WorkspaceRoute> {}
