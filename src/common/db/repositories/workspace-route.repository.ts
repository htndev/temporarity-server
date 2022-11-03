import { Injectable } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { EntityRepository } from 'typeorm';
import { URLLayer } from './../../entities/url-layer.entity';
import { getSuitableRoute } from './../../utils/workspace-routes.util';
import { WorkspaceRoute } from './../entities/workspace-route.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(WorkspaceRoute)
export class WorkspaceRouteRepository extends BaseRepository<WorkspaceRoute> {
  async getRouteByPath(workspaceId: ObjectID, path: string): Promise<WorkspaceRoute | null> {
    const routes = await this.findWorkspaceRoutes(workspaceId, path);

    if (!routes.length) {
      return null;
    }

    if (routes.length === 1) {
      return routes[0];
    }

    const incomingRouteLayer = new URLLayer(path);

    const theMostSuitableLayer = routes
      .map((route) => new URLLayer(route.path))
      .reduce((best, current) => getSuitableRoute(best, current, incomingRouteLayer));

    return routes.find((route) => route.path === theMostSuitableLayer.path);
  }

  async sameRouteExists(workspaceId: ObjectID, path: string): Promise<WorkspaceRoute | false> {
    const route = await this.getRouteByPath(workspaceId, path);

    if (!route) {
      return false;
    }

    const suitableRoute = getSuitableRoute(new URLLayer(path), new URLLayer(route.path), new URLLayer(path));

    return suitableRoute.path === route.path ? route : false;
  }

  async findWorkspaceRoutes(workspaceId: ObjectID, path: string): Promise<WorkspaceRoute[]> {
    const routes = await this.find({ workspaceId });

    return routes.filter((route) => route.pathPattern.test(path)) || null;
  }
}
