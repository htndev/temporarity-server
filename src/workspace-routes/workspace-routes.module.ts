import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'nestjs-s3';
import { provideCustomRepository } from 'src/common/utils/db.util';
import { User } from './../common/db/entities/user.entity';
import { WorkspaceMembership } from './../common/db/entities/workspace-membership.entity';
import { WorkspaceRole } from './../common/db/entities/workspace-role.entity';
import { WorkspaceRouteRequest } from './../common/db/entities/workspace-route-request.entity';
import { WorkspaceRouteResponseHeader } from './../common/db/entities/workspace-route-response-header.entity';
import { WorkspaceRouteResponse } from './../common/db/entities/workspace-route-response.entity';
import { WorkspaceRoute } from './../common/db/entities/workspace-route.entity';
import { Workspace } from './../common/db/entities/workspace.entity';
import { UserRepository } from './../common/db/repositories/user.repository';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceRouteRequestRepository } from './../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseHeaderRepository } from './../common/db/repositories/workspace-route-response-header.entity';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { ConfigModule } from './../common/providers/config/config.module';
import { SecurityConfig } from './../common/providers/config/security.config';
import { WorkspaceRoutesController } from './workspace-routes.controller';
import { WorkspaceRoutesService } from './workspace-routes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      WorkspaceMembership,
      WorkspaceRole,
      WorkspaceRoute,
      WorkspaceRouteRequest,
      WorkspaceRouteResponseHeader,
      WorkspaceRouteResponse
    ]),
    ConfigModule,
    S3Module.forRootAsync({
      imports: [ConfigModule],
      inject: [SecurityConfig],
      useFactory: (securityConfig: SecurityConfig) => ({
        config: {
          accessKeyId: securityConfig.s3AccessKeyId,
          secretAccessKey: securityConfig.s3AccessSecretKey
        }
      })
    })
  ],
  controllers: [WorkspaceRoutesController],
  providers: [
    WorkspaceRoutesService,
    provideCustomRepository(User, UserRepository),
    provideCustomRepository(Workspace, WorkspaceRepository),
    provideCustomRepository(WorkspaceMembership, WorkspaceMembershipRepository),
    provideCustomRepository(WorkspaceRole, WorkspaceRoleRepository),
    provideCustomRepository(WorkspaceRoute, WorkspaceRouteRepository),
    provideCustomRepository(WorkspaceRouteRequest, WorkspaceRouteRequestRepository),
    provideCustomRepository(WorkspaceRouteResponseHeader, WorkspaceRouteResponseHeaderRepository),
    provideCustomRepository(WorkspaceRouteResponse, WorkspaceRouteResponseRepository)
  ]
})
export class WorkspaceRoutesModule {}
