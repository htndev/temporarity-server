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
import { RouteResponseType } from './../common/types/workspace-route.type';
import { buildRoutePath } from './../common/utils/workspace-routes.util';
import { CreateWorkspaceRouteDto } from './entities/create-workspace-route.dto';
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
      console.log('File detected', createWorkspaceRouteDto.response);
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
}
