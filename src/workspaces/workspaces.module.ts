import { UserRepository } from './../common/db/repositories/user.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { SecurityProvider } from './../common/services/security.provider';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceRepository,
      WorkspaceMembershipRepository,
      WorkspaceRoleRepository,
      UserRepository
    ])
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, SecurityProvider]
})
export class WorkspacesModule {}
