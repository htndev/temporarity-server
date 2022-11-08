import { WorkspaceRoute } from './../common/db/entities/workspace-route.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { HttpMethod } from './../common/types/workspace-route.type';

@Injectable()
export class RoutesService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRouteRepository: WorkspaceRouteRepository
  ) {}

  async incomingRequest({
    slug,
    query,
    body,
    headers,
    request,
    method
  }: {
    slug: string;
    query: any;
    body: any;
    headers: any;
    request: Request;
    method: HttpMethod;
  }) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const incomingRoute = request.params[0];
    const route = await this.workspaceRouteRepository.getRouteByPath(workspace.id, incomingRoute);

    if (!route) {
      return this.notFoundError(incomingRoute, method);
    }

    if (!route.methods.includes(method) || !route.methods.includes(HttpMethod.ALL)) {
      return this.notFoundError(incomingRoute, method);
    }

    return {
      route
    };
  }

  private async notFoundError(path: string, method: HttpMethod) {
    const errorMessage = `Route /${path} with method ${method} not found`;

    throw new NotFoundException(errorMessage);
  }
}
