import { Injectable } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { Route } from '../../../workspace-routes/entities/route.entity';
import { URLLayer } from '../../entities/url-layer.entity';
import { Nullable } from '../../types/base.type';
import { WorkspaceRouteResponseType } from '../../types/workspace-route-response.type';
import { HttpMethod } from '../../types/workspace-route.type';
import { buildRoutePath, buildRoutePattern, isSuitableRoute } from '../../utils/workspace-routes.util';
import { WorkspaceRouteRequest } from '../entities/workspace-route-request.entity';
import { WorkspaceRouteResponse } from '../entities/workspace-route-response.entity';
import { WorkspaceRoute } from '../entities/workspace-route.entity';
import { Boxed } from './../../../domains/generator/utils/base.type';
import { transformObjectId } from './../../utils/db.util';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceRouteRepository extends BaseRepository<WorkspaceRoute> {
  async getRouteByPath(
    workspaceId: ObjectID,
    path: string,
    methodsOrMethod: Boxed<HttpMethod>
  ): Promise<Nullable<WorkspaceRoute[]>> {
    const routes = await this.find({
      where: {
        workspaceId,
        methods: {
          // @ts-ignore
          $in: [...new Set([...(Array.isArray(methodsOrMethod) ? methodsOrMethod : [methodsOrMethod])])]
        }
      }
    }).then((routes) => routes.filter((route) => route.pathPattern.test(`/${path}`)));

    if (!routes.length) {
      return null;
    }

    if (routes.length === 1) {
      const [route] = routes;

      return isSuitableRoute(new URLLayer(route.path), new URLLayer(path)) ? [route] : null;
    }

    const routesLayers = routes.map((route) => new URLLayer(route.path));
    const incomingRouteLayer = new URLLayer(path);

    const theMostSuitableLayers = routesLayers.filter((route: any) => isSuitableRoute(route, incomingRouteLayer));
    const maxValue = Math.max(...theMostSuitableLayers.map((layer) => layer.value));
    const routesWithMaxValue = theMostSuitableLayers
      .filter((layer) => layer.value === maxValue)
      .map((layer) => routes.find((route) => route.path === layer.path));

    return routesWithMaxValue;
  }

  async findWorkspaceRoutes(workspaceId: ObjectID, path: string): Promise<WorkspaceRoute[]> {
    const routes = await this.find({ where: { workspaceId } });

    return routes.filter((route) => route.pathPattern.test(`/${path}`)) || null;
  }

  async getRoutes(workspaceId: ObjectID): Promise<Route[]> {
    return this.find({ where: { workspaceId } }).then((routes) =>
      routes.map((route) => new Route(route._id, route.path, route.methods, route.status))
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
    workspaceRouteRequest.routeId = workspaceRoute._id;
    await workspaceRouteRequest.save();

    const workspaceRouteResponse = new WorkspaceRouteResponse();
    workspaceRouteResponse.routeId = workspaceRoute._id;
    workspaceRouteResponse.responseType = responseType;
    workspaceRouteResponse.schema = response;
    await workspaceRouteResponse.save();

    return workspaceRoute;
  }

  async getRoute(workspaceId: ObjectID, id: ObjectID | string): Promise<WorkspaceRoute | null> {
    return this.findOne({ where: { _id: transformObjectId(id), workspaceId } });
  }
}
