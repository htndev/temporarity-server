import { RequestValidationStrategy, REQUEST_VALIDATION_STRATEGIES } from './../common/constants/routes.constant';
import { WorkspaceRouteAuthorizationRepository } from './../common/db/repositories/workspace-route-authorization.repository';
import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { ObjectID } from 'typeorm';
import { v4 } from 'uuid';
import { ALLOWED_HTTP_METHODS } from '../common/constants/routes.constant';
import { WorkspaceRoute } from '../common/db/entities/workspace-route.entity';
import { WorkspaceRouteRequestRepository } from '../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseRepository } from '../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from '../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from '../common/db/repositories/workspace.repository';
import { SecurityConfig } from '../common/providers/config/security.config';
import { HttpResponse } from '../common/types/response.type';
import { WorkspaceRouteResponseType } from '../common/types/workspace-route-response.type';
import { HttpMethod, RouteResponseType } from '../common/types/workspace-route.type';
import { buildRoutePath, buildRoutePattern } from '../common/utils/workspace-routes.util';
import { Placeholder } from '../common/types/workspace-route.type';
import { CreateWorkspaceRouteDto } from './dto/create-workspace-route.dto';
import { UpdateRouteMethodsDto } from './dto/update-route-methods.dto';
import { UpdateRoutePathDto } from './dto/update-route-path.dto';
import { UpdateRouteResponseDto } from './dto/update-route-response.dto';
import { UpdateRouteStatusDto } from './dto/update-route-status.dto';
import { UpdateRouteAuthorizationDto } from './dto/update-route-authorization.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mime = require('mime-types');

@Injectable()
export class WorkspaceRoutesService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRouteRepository: WorkspaceRouteRepository,
    private readonly workspaceRouteRequestRepository: WorkspaceRouteRequestRepository,
    private readonly workspaceRouteResponseRepository: WorkspaceRouteResponseRepository,
    private readonly workspaceRouteAuthorizationRepository: WorkspaceRouteAuthorizationRepository,
    @InjectS3() private readonly s3Client: S3,
    private readonly securityConfig: SecurityConfig
  ) {}

  async getWorkspaceRoutes(slug: string): Promise<HttpResponse<{ routes: any[] }>> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const routes = await this.workspaceRouteRepository.getRoutes(workspace._id);

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

    if (createWorkspaceRouteDto.path.includes(Placeholder.Wildcard)) {
      const startsWithWildcardRegExp = /^\/\*\//;
      const endsWithWildcardRegExp = /\/\*$/;
      const singleWildcardRegExp = /\/\/*\//;
      const path = buildRoutePath(createWorkspaceRouteDto.path);

      if (
        [startsWithWildcardRegExp, endsWithWildcardRegExp, singleWildcardRegExp].some((regExp) => regExp.test(path))
      ) {
        throw new BadRequestException("Invalid path provided. Wildcard placeholder couldn't be used in single way.");
      }
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    const similarRoutes = await this.workspaceRouteRepository.getRouteByPath(
      workspace._id,
      buildRoutePath(createWorkspaceRouteDto.path),
      createWorkspaceRouteDto.methods
    );

    if (similarRoutes) {
      const [similarRoute] = similarRoutes;

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
      workspace._id,
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
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);
    const response = await this.workspaceRouteResponseRepository.findOne({ where: { routeId: route._id } });
    let authorization = await this.workspaceRouteAuthorizationRepository.findOne({
      where: { routeId: route._id }
    });

    if (!authorization) {
      authorization = await this.workspaceRouteAuthorizationRepository.create({
        routeId: route._id,
        strategy: RequestValidationStrategy.NONE
      });
    }

    return {
      status: HttpStatus.OK,
      message: 'Route details retrieved successfully',
      responseType: response.responseType,
      response: response.schema,
      authorization: {
        strategy: authorization.strategy,
        payload: authorization.payload || null
      }
    };
  }

  async updateRouteMethods(slug: string, id: string, updateRouteMethodsDto: UpdateRouteMethodsDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);

    if (
      updateRouteMethodsDto.methods.length === 0 &&
      updateRouteMethodsDto.methods.every((method) => ALLOWED_HTTP_METHODS.includes(method))
    ) {
      throw new BadRequestException('Invalid HTTP methods provided.');
    }

    const conflictingRoute = await this.getConflictingRoute(workspace._id, route, updateRouteMethodsDto.methods);

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
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);

    const conflictingRoutes = await this.workspaceRouteRepository.getRouteByPath(
      workspace._id,
      buildRoutePath(updateRoutePathDto.path),
      route.methods
    );

    const hasConflictingRoute = conflictingRoutes !== null;

    if (hasConflictingRoute) {
      const [conflictingRoute] = conflictingRoutes;

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
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);

    route.status = updateRouteStatusDto.status;

    await route.save();

    return {
      status: HttpStatus.OK,
      message: 'Route status updated successfully'
    };
  }

  async updateRouteResponse(slug: string, id: string, updateRouteResponseDto: UpdateRouteResponseDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);

    if (updateRouteResponseDto.responseType === WorkspaceRouteResponseType.File) {
      const possibleBuffer: Buffer = (updateRouteResponseDto.response as any)?.buffer;
      if (possibleBuffer instanceof Buffer) {
        const contentType = (updateRouteResponseDto.response as any).mimetype;
        const ext = mime.extension(contentType);
        const key = v4();
        const path = `${this.securityConfig.s3BucketFolder}/${key}.${ext}`;
        const { Location: url } = await this.s3Client
          .upload({
            Bucket: this.securityConfig.s3BucketName,
            ACL: 'public-read',
            Body: possibleBuffer,
            Key: path
          })
          .promise();
        updateRouteResponseDto.response = url;
      }
    }
    const response = await this.workspaceRouteResponseRepository.findOne({ where: { routeId: route._id } });

    response.responseType = updateRouteResponseDto.responseType;
    response.schema = updateRouteResponseDto.response as any;

    await response.save();

    return {
      status: HttpStatus.OK,
      message: 'Route response updated successfully'
    };
  }

  async updateRouteAuthorization(slug: string, id: string, updateRouteAuthorizationDto: UpdateRouteAuthorizationDto) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, id);

    let routeAuthorization = await this.workspaceRouteAuthorizationRepository.findOne({
      where: { routeId: route._id }
    });

    if (!routeAuthorization) {
      routeAuthorization = this.workspaceRouteAuthorizationRepository.create({
        routeId: route._id,
        strategy: RequestValidationStrategy.NONE
      });
    }

    if (
      updateRouteAuthorizationDto.strategy === RequestValidationStrategy.NONE &&
      routeAuthorization.strategy === RequestValidationStrategy.NONE
    ) {
      return {
        status: HttpStatus.OK,
        message: 'Route authorization updated successfully'
      };
    }

    if (!REQUEST_VALIDATION_STRATEGIES.includes(updateRouteAuthorizationDto.strategy)) {
      throw new BadRequestException('Invalid request validation strategy provided.');
    }

    if (updateRouteAuthorizationDto.strategy === RequestValidationStrategy.NONE) {
      routeAuthorization.strategy = updateRouteAuthorizationDto.strategy;
      routeAuthorization.payload = null;
    } else {
      if (!updateRouteAuthorizationDto.payload) {
        throw new BadRequestException('Payload is required for this strategy.');
      }

      routeAuthorization.strategy = updateRouteAuthorizationDto.strategy;
      routeAuthorization.payload = updateRouteAuthorizationDto.payload;
    }

    await routeAuthorization.save();

    return {
      status: HttpStatus.OK,
      message: 'Route authorization updated successfully'
    };
  }

  async deleteRoute(slug: string, routeId: string) {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const route = await this.workspaceRouteRepository.getRoute(workspace._id, routeId);

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const searchCondition = { where: { routeId: route._id } };

    const routeRequest = await this.workspaceRouteRequestRepository.findOne(searchCondition);
    const routeResponseHeaders = await this.workspaceRouteRequestRepository.find(searchCondition);
    const routeResponse = await this.workspaceRouteResponseRepository.findOne(searchCondition);

    await routeResponse.remove();
    await routeRequest.remove();
    await Promise.all(routeResponseHeaders.map(async (header) => await header.remove()));
    await route.remove();

    return {
      status: HttpStatus.OK,
      message: 'Route deleted successfully'
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
        wr._id.toString() !== route._id.toString()
    );

    return conflictRoute ?? null;
  }
}
