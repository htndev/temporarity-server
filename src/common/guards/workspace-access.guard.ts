import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../constants/role.constant';
import { UserRepository } from '../db/repositories/user.repository';
import { WorkspaceMembershipRepository } from '../db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from '../db/repositories/workspace-role.repository';
import { WorkspaceRepository } from '../db/repositories/workspace.repository';
import { WORKSPACE_ROLES_DECORATOR_KEY } from '../decorators/workspace-roles.decorator';
import { SafeUser } from '../types/auth.type';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(WorkspaceRepository) private readonly workspaceRepository: WorkspaceRepository,
    @InjectRepository(WorkspaceMembershipRepository)
    private readonly workspaceMembershipRepository: WorkspaceMembershipRepository,
    @InjectRepository(WorkspaceRoleRepository) private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get<Role[]>(WORKSPACE_ROLES_DECORATOR_KEY, context.getHandler());
    const { slug } = request.params as { slug: string };

    if (!slug) {
      throw new NotFoundException('Missing slug');
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const { user } = request as { user: SafeUser };

    if (!user) {
      throw new UnauthorizedException('Missing user');
    }

    const userId = await this.userRepository.retrieveId({ email: user.email });
    const membership = await this.workspaceMembershipRepository.getUserMembership(workspace.id, userId);

    if (!membership) {
      throw new ForbiddenException();
    }

    if (!roles || !roles.length) {
      return true;
    }

    const role = await this.workspaceRoleRepository.getRoleById(membership.role);

    if (!role) {
      throw new ForbiddenException();
    }

    if (!roles.includes(role.name)) {
      throw new ForbiddenException("You don't have enough permissions to access this resource");
    }

    return true;
  }
}
