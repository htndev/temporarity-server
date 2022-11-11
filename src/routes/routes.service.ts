import { Injectable, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import * as https from 'https';
import { WorkspaceRouteResponseType } from 'src/common/types/workspace-route-response.type';
import { Readable } from 'stream';
import { GeneratorProvider } from '../common/providers/generator.provider';
import { RANDOM_IMAGE_SIZES } from './../common/constants/routes.constant';
import { WorkspaceRoute } from './../common/db/entities/workspace-route.entity';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { HttpMethod } from './../common/types/workspace-route.type';
import { redirect } from './../common/utils/redirect.util';

@Injectable()
export class RoutesService {
  private readonly randomImageUrl = 'https://picsum.photos';

  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRouteRepository: WorkspaceRouteRepository,
    private readonly workspaceRouteResponseRepository: WorkspaceRouteResponseRepository,
    private readonly generatorProvider: GeneratorProvider
  ) {}

  async incomingRequest({
    slug,
    query,
    body,
    headers,
    request,
    method,
    response
  }: {
    slug: string;
    query: any;
    body: any;
    headers: any;
    request: Request;
    method: HttpMethod;
    response: Response;
  }) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const incomingRoute = request.params[0];
    const route = await this.workspaceRouteRepository.getRouteByPath(workspace.id, incomingRoute);

    if (!route) {
      return this.notFoundError(incomingRoute, method);
    }

    if (!route.methods.includes(method) && !route.methods.includes(HttpMethod.ALL)) {
      return this.notFoundError(incomingRoute, method);
    }

    return this.buildResponse(route, response);
  }

  private async buildResponse(route: WorkspaceRoute, response: Response) {
    const workspaceResponse = await this.workspaceRouteResponseRepository.findOne({ where: { routeId: route.id } });
    response.status(route.status);

    switch (true) {
      case workspaceResponse.responseType === WorkspaceRouteResponseType.Schema:
        return response.json(this.generatorProvider.generate(workspaceResponse.schema));
      case workspaceResponse.responseType === WorkspaceRouteResponseType.File: {
        const buffer = await this.getImage(workspaceResponse.schema as string);
        const stream = Readable.from(buffer);
        return stream.pipe(response);
      }
      case workspaceResponse.responseType === WorkspaceRouteResponseType.RandomImage:
        return redirect(response, this.randomImage());
    }
  }

  private async getImage(url: string): Promise<Buffer> {
    return this.fetchFile(url);
  }

  private fetchFile(url: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];

      https.get(url, (response: IncomingMessage) =>
        response.on('data', (chunk: Buffer) => chunks.push(chunk)).once('end', () => resolve(Buffer.concat(chunks)))
      );
    });
  }

  private randomImage() {
    const [width, height] = RANDOM_IMAGE_SIZES[Math.floor(Math.random() * RANDOM_IMAGE_SIZES.length)].split('x');
    return `${this.randomImageUrl}/${width}/${height}`;
  }

  private async notFoundError(path: string, method: HttpMethod) {
    const errorMessage = `Route /${path} with method ${method} not found`;

    throw new NotFoundException(errorMessage);
  }
}
