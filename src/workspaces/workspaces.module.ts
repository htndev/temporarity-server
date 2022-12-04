import { WorkspaceRouteAuthorizationRepository } from './../common/db/repositories/workspace-route-authorization.repository';
import { WorkspaceRouteAuthorization } from './../common/db/entities/workspace-route-authorization.entity';
import { WorkspaceRoutesTemplateRepository } from './../common/db/repositories/workspace-routes-template.repository';
import { WorkspaceRoutesTemplate } from './../common/db/entities/workspace-routes-template.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/db/entities/user.entity';
import { WorkspaceInvitation } from '../common/db/entities/workspace-invitation.entity';
import { WorkspaceMembership } from '../common/db/entities/workspace-membership.entity';
import { WorkspaceRole } from '../common/db/entities/workspace-role.entity';
import { WorkspaceRouteRequest } from '../common/db/entities/workspace-route-request.entity';
import { WorkspaceRouteResponseHeader } from '../common/db/entities/workspace-route-response-header.entity';
import { WorkspaceRouteResponse } from '../common/db/entities/workspace-route-response.entity';
import { WorkspaceRoute } from '../common/db/entities/workspace-route.entity';
import { Workspace } from '../common/db/entities/workspace.entity';
import { UserRepository } from '../common/db/repositories/user.repository';
import { WorkspaceInvitationRepository } from '../common/db/repositories/workspace-invitation.repository';
import { WorkspaceMembershipRepository } from '../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from '../common/db/repositories/workspace-role.repository';
import { WorkspaceRouteRequestRepository } from '../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseHeaderRepository } from '../common/db/repositories/workspace-route-response-header.entity';
import { WorkspaceRouteResponseRepository } from '../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from '../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from '../common/db/repositories/workspace.repository';
import { ConfigModule } from '../common/providers/config/config.module';
import { EmailModule } from '../common/providers/email/email.module';
import { SecurityModule } from '../common/providers/security/security.module';
import { provideCustomRepository } from '../common/utils/db.util';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [
    SecurityModule,
    EmailModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      WorkspaceMembership,
      Workspace,
      WorkspaceRole,
      WorkspaceRoute,
      WorkspaceRouteRequest,
      WorkspaceRouteResponseHeader,
      WorkspaceRouteResponse,
      WorkspaceInvitation,
      WorkspaceRoutesTemplate,
      WorkspaceRouteAuthorization
    ])
  ],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    provideCustomRepository(User, UserRepository),
    provideCustomRepository(WorkspaceMembership, WorkspaceMembershipRepository),
    provideCustomRepository(WorkspaceRole, WorkspaceRoleRepository),
    provideCustomRepository(Workspace, WorkspaceRepository),
    provideCustomRepository(WorkspaceRoute, WorkspaceRouteRepository),
    provideCustomRepository(WorkspaceRouteRequest, WorkspaceRouteRequestRepository),
    provideCustomRepository(WorkspaceRouteResponseHeader, WorkspaceRouteResponseHeaderRepository),
    provideCustomRepository(WorkspaceRouteResponse, WorkspaceRouteResponseRepository),
    provideCustomRepository(WorkspaceInvitation, WorkspaceInvitationRepository),
    provideCustomRepository(WorkspaceRoutesTemplate, WorkspaceRoutesTemplateRepository),
    provideCustomRepository(WorkspaceRouteAuthorization, WorkspaceRouteAuthorizationRepository)
  ]
})
export class WorkspacesModule {}
