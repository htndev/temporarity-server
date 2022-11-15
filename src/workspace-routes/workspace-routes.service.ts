import { WorkspaceRoute } from './../common/db/entities/workspace-route.entity';
import { ObjectID } from 'mongodb';
import { BadRequestException, ConflictException, HttpStatus, Injectable } from '@nestjs/common';
// import { fromBuffer } from 'file-type';
import { InjectS3, S3 } from 'nestjs-s3';
import { v4 } from 'uuid';
import { ALLOWED_HTTP_METHODS } from './../common/constants/routes.constant';
import { WorkspaceRouteRequestRepository } from './../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { SecurityConfig } from './../common/providers/config/security.config';
import { HttpResponse } from './../common/types/response.type';
import { WorkspaceRouteResponseType } from './../common/types/workspace-route-response.type';
import { RouteResponseType, HttpMethod } from './../common/types/workspace-route.type';
import { buildRoutePath, buildRoutePattern } from './../common/utils/workspace-routes.util';
import { CreateWorkspaceRouteDto } from './dto/create-workspace-route.dto';
import { UpdateRoutePathDto } from './dto/update-route-path.dto';
import { UpdateRouteStatusDto } from './dto/update-route-status.dto';
import { UpdateRouteMethodsDto } from './dto/update-route-methods.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mime = require('mime-types');

@Injectable()
export class WorkspaceRoutesService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRouteRepository: WorkspaceRouteRepository,
    private readonly workspaceRouteRequestRepository: WorkspaceRouteRequestRepository,
    private readonly workspaceRouteResponseRepository: WorkspaceRouteResponseRepository,
    @InjectS3() private readonly s3Client: S3,
    private readonly securityConfig: SecurityConfig
  ) {}

  async getWorkspaceRoutes(slug: string): Promise<HttpResponse<{ routes: any[] }>> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const routes = await this.workspaceRouteRepository.getRoutes(workspace.id);

    return {
      status: HttpStatus.OK,
      message: 'Workspace routes retrieved successfully',
      routes
    };
  }

  async createRoute(slug: string, createWorkspaceRouteDto: CreateWorkspaceRouteDto) {
    if (
      createWorkspaceRouteDto.methods.length === 0 &&
      createWorkspaceRouteDto.methods.every((method) => ALLOWED_HTTP_METHODS.includes(method))
    ) {
      throw new BadRequestException('Invalid HTTP methods provided.');
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    const similarRoute = await this.workspaceRouteRepository.sameRouteExists(
      workspace.id,
      buildRoutePath(createWorkspaceRouteDto.path),
      createWorkspaceRouteDto.methods
    );

    if (similarRoute) {
      throw new ConflictException(
        `Route '${createWorkspaceRouteDto.path}' is conflicting with '${similarRoute.path}' route.`
      );
    }

    const possibleBuffer: Buffer = (createWorkspaceRouteDto.response as any)?.buffer;
    let insertData: RouteResponseType;

    if (createWorkspaceRouteDto.responseType === WorkspaceRouteResponseType.File && possibleBuffer instanceof Buffer) {
      const contentType = (createWorkspaceRouteDto.response as any).mimetype;
      const ext = mime.extension(contentType);
      const key = v4();
      const path = `${this.securityConfig.s3BucketFolder}/${key}.${ext}`;
      const { Location: url } = await await this.s3Client
        .upload({
          Bucket: this.securityConfig.s3BucketName,
          ACL: 'public-read',
          Body: possibleBuffer,
          Key: path
        })
        .promise();
      insertData = url;
    } else if (createWorkspaceRouteDto.responseType === WorkspaceRouteResponseType.RandomImage) {
      insertData = null;
    } else if (createWorkspaceRouteDto.responseType === WorkspaceRouteResponseType.Schema) {
      insertData = createWorkspaceRouteDto.response;
    }

    await this.workspaceRouteRepository.createRoute(
      workspace.id,
      createWorkspaceRouteDto.path,
      [...new Set(createWorkspaceRouteDto.methods)],
      createWorkspaceRouteDto.status,
      createWorkspaceRouteDto.responseType,
      insertData
    );

    return {
      status: HttpStatus.CREATED,
      message: 'Route created successfully'
    };
  }

  async getRouteDetails(slug: string, id: string) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace.id, id);
    const response = await this.workspaceRouteResponseRepository.findOne({ where: { routeId: route.id } });

    return {
      status: HttpStatus.OK,
      message: 'Route details retrieved successfully',
      responseType: response.responseType,
      response: response.schema
    };
  }

  async updateRouteMethods(slug: string, id: string, updateRouteMethodsDto: UpdateRouteMethodsDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace.id, id);

    if (
      updateRouteMethodsDto.methods.length === 0 &&
      updateRouteMethodsDto.methods.every((method) => ALLOWED_HTTP_METHODS.includes(method))
    ) {
      throw new BadRequestException('Invalid HTTP methods provided.');
    }

    const conflictingRoute = await this.getConflictingRoute(workspace.id, route, updateRouteMethodsDto.methods);

    if (conflictingRoute) {
      throw new ConflictException(
        `Route '${route.path}' is conflicting with '${conflictingRoute.path}' route. They have conflicted method/methods.`
      );
    }

    route.methods = updateRouteMethodsDto.methods;

    await route.save();

    return {
      status: HttpStatus.OK,
      message: 'Route methods updated successfully'
    };
  }

  async updateRoutePath(slug: string, id: string, updateRoutePathDto: UpdateRoutePathDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace.id, id);

    const conflictingRoute = await this.workspaceRouteRepository.getRouteByPath(
      workspace.id,
      buildRoutePath(updateRoutePathDto.path)
    );

    if (conflictingRoute && conflictingRoute.methods.some((method) => route.methods.includes(method))) {
      const conflictingMethods = conflictingRoute.methods.filter((method) => route.methods.includes(method));
      throw new ConflictException(
        `Route '${updateRoutePathDto.path}' is conflicting with '${
          conflictingRoute.path
        }' route. They have conflicted ${conflictingMethods.join(', ')} ${
          conflictingMethods.length === 1 ? 'method' : 'methods'
        }.`
      );
    }

    route.path = buildRoutePath(updateRoutePathDto.path);
    route.pathPattern = buildRoutePattern(updateRoutePathDto.path);

    await route.save();

    return {
      status: HttpStatus.OK,
      message: 'Route path updated successfully'
    };
  }

  async updateRouteStatus(slug: string, id: string, updateRouteStatusDto: UpdateRouteStatusDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace.id, id);

    route.status = updateRouteStatusDto.status;

    await route.save();

    return {
      status: HttpStatus.OK,
      message: 'Route status updated successfully'
    };
  }

  private async getConflictingRoute(
    workspaceId: ObjectID,
    route: WorkspaceRoute,
    methods: HttpMethod[]
  ): Promise<WorkspaceRoute | null> {
    const routes = await this.workspaceRouteRepository.findWorkspaceRoutes(workspaceId, route.path);

    const conflictRoute = routes.find(
      (wr) =>
        methods.some((method) => wr.methods.includes(method)) &&
        wr.pathPattern.toString() === route.pathPattern.toString() &&
        wr.id.toString() !== route.id.toString()
    );

    return conflictRoute ?? null;
  }
}
