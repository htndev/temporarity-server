import { SecurityConfig } from './../common/providers/config/security.config';
import { ConfigModule } from './../common/providers/config/config.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'nestjs-s3';
import { UserRepository } from './../common/db/repositories/user.repository';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceRouteRequestRepository } from './../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseHeaderRepository } from './../common/db/repositories/workspace-route-response-header.entity';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { WorkspaceRoutesController } from './workspace-routes.controller';
import { WorkspaceRoutesService } from './workspace-routes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      WorkspaceMembershipRepository,
      WorkspaceRepository,
      WorkspaceRoleRepository,
      WorkspaceRouteRepository,
      WorkspaceRouteRequestRepository,
      WorkspaceRouteResponseHeaderRepository,
      WorkspaceRouteResponseRepository
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
  providers: [WorkspaceRoutesService]
})
export class WorkspaceRoutesModule {}
