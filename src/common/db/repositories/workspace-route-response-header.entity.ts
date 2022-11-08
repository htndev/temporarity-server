import { Injectable } from '@nestjs/common';
import { EntityRepository, ObjectID } from 'typeorm';
import { WorkspaceRouteResponseHeader } from '../entities/workspace-route-response-header.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRouteResponseHeader)
export class WorkspaceRouteResponseHeaderRepository extends BaseRepository<WorkspaceRouteResponseHeader> {
  async addRequestHeaders(routeRequestId: ObjectID, { header, value }: { header: string; value: any }): Promise<void> {
    await this.insert({ routeRequestId, header, value });
  }

  async getRouteRequestHeaders(routeRequestId: ObjectID): Promise<{ header: string; value: any }[]> {
    const headers = await this.find({ routeRequestId });

    return headers.map(({ header, value }) => ({ header, value }));
  }
}
