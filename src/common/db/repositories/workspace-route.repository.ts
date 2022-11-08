import { Injectable } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import { EntityRepository } from 'typeorm';
import { Route } from './../../../workspace-routes/entities/route.entity';
import { URLLayer } from './../../entities/url-layer.entity';
import { Nullable } from './../../types/base.type';
import { WorkspaceRouteResponseType } from './../../types/workspace-route-response.type';
import { HttpMethod } from './../../types/workspace-route.type';
import { buildRoutePath, buildRoutePattern, getSuitableRoute } from './../../utils/workspace-routes.util';
import { WorkspaceRouteRequest } from './../entities/workspace-route-request.entity';
import { WorkspaceRouteResponse } from './../entities/workspace-route-response.entity';
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

  async sameRouteExists(workspaceId: ObjectID, path: string, methods: HttpMethod[]): Promise<WorkspaceRoute | false> {
    const route = await this.getRouteByPath(workspaceId, path);

    if (!route) {
      return false;
    }

    if (methods.every((method) => !route.methods.includes(method))) {
      return null;
    }

    const suitableRoute = getSuitableRoute(new URLLayer(path), new URLLayer(route.path), new URLLayer(path));

    return suitableRoute.path === route.path ? route : false;
  }

  async findWorkspaceRoutes(workspaceId: ObjectID, path: string): Promise<WorkspaceRoute[]> {
    const routes = await this.find({ workspaceId });

    return routes.filter((route) => route.pathPattern.test(path)) || null;
  }

  async getRoutes(workspaceId: ObjectID): Promise<Route[]> {
    return this.find({ workspaceId }).then((routes) =>
      routes.map((route) => new Route(route.path, route.methods, route.status))
    );
  }

  async createRoute(
    workspaceId: ObjectID,
    path: string,
    methods: HttpMethod[],
    status: number,
    responseType: WorkspaceRouteResponseType,
    response: Nullable<string | Record<string, any>>
  ): Promise<WorkspaceRoute> {
    const workspaceRoute = this.create({
      workspaceId,
      path: buildRoutePath(path),
      pathPattern: buildRoutePattern(path),
      methods,
      status
    });

    await workspaceRoute.save();

    const workspaceRouteRequest = new WorkspaceRouteRequest();
    workspaceRouteRequest.routeId = workspaceRoute.id;
    await workspaceRouteRequest.save();

    const workspaceRouteResponse = new WorkspaceRouteResponse();
    workspaceRouteResponse.routeId = workspaceRoute.id;
    workspaceRouteResponse.responseType = responseType;
    workspaceRouteResponse.schema = response;
    await workspaceRouteResponse.save();

    return workspaceRoute;
  }
}
