import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { WorkspaceRouteRequestField } from './../entities/workspace-route-request-field.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRouteRequestField)
export class WorkspaceRouteRequestFieldRepository extends BaseRepository<WorkspaceRouteRequestField> {}
