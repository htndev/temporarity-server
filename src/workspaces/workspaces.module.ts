import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './../common/db/repositories/user.repository';
import { WorkspaceInvitationRepository } from './../common/db/repositories/workspace-invitation.repository';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceRouteRequestRepository } from './../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { ConfigModule } from './../common/providers/config/config.module';
import { EmailModule } from './../common/providers/email/email.module';
import { SecurityModule } from './../common/providers/security/security.module';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [
    SecurityModule,
    EmailModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      UserRepository,
      WorkspaceMembershipRepository,
      WorkspaceRepository,
      WorkspaceRoleRepository,
      WorkspaceRouteRepository,
      WorkspaceRouteRequestRepository,
      WorkspaceRouteResponseRepository,
      WorkspaceInvitationRepository
    ])
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService]
})
export class WorkspacesModule {}
