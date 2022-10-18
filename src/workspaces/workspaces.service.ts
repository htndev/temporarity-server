import { UserRepository } from './../common/db/repositories/user.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { SecurityProvider } from './../common/services/security.provider';
import { SafeUser } from './../common/types/auth.type';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { HttpStatus, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpResponse } from './../common/types/response.type';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(WorkspaceRepository) private readonly workspaceRepository: WorkspaceRepository,
    @InjectRepository(WorkspaceMembershipRepository)
    private readonly workspaceMembershipRepository: WorkspaceMembershipRepository,
    @InjectRepository(WorkspaceRoleRepository) private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    private readonly securityProvider: SecurityProvider
  ) {}

  async create({ name, slug, description }: CreateWorkspaceDto, user: SafeUser) {
    const workspaceWithSlugExists = await this.workspaceRepository.isExists({ slug });

    if (workspaceWithSlugExists) {
      throw new ConflictException('Workspace with this slug already exists');
    }

    const workspace = await this.workspaceRepository.create({
      name,
      slug,
      description,
      apiKey: await this.securityProvider.encrypt(`${user.id}-${Date.now()}-${slug}`)
    });

    await workspace.save();

    const workspaceMembership = this.workspaceMembershipRepository.create({
      workspaceId: workspace.id,
      userId: user.id,
      role: await this.workspaceRoleRepository.getOwnerRoleId()
    });

    await workspaceMembership.save();

    return {
      status: HttpStatus.CREATED
    };
  }

  async findAll(user: SafeUser): Promise<HttpResponse<{ workspaces: Workspace[] }>> {
    const userMemberships = await this.workspaceMembershipRepository.find({ userId: user.id });
    const workspaces = await Promise.all(
      userMemberships.map(async (membership) => {
        const allMemberships = await this.workspaceMembershipRepository.find({ workspaceId: membership.workspaceId });
        const users = await this.userRepository.safeFindUsers(allMemberships.map((m) => m.userId));
        const usersWithRoles = await Promise.all(
          users.map(async (user) => {
            const record = await this.workspaceMembershipRepository.findOne({
              userId: user.id,
              workspaceId: membership.workspaceId
            });
            const role = await this.workspaceRoleRepository.findOne(record.role);

            return {
              ...user,
              role: role.name
            };
          })
        );

        const workspace = await this.workspaceRepository.getShortInformation(membership.workspaceId);

        return new Workspace(
          String(workspace.id),
          workspace.name,
          workspace.description,
          workspace.slug,
          usersWithRoles
        );
      })
    );

    return {
      status: HttpStatus.OK,
      message: 'User workspaces retrieved successfully',
      workspaces
    };
  }

  async hasAccess(slug: string, user: SafeUser): Promise<HttpResponse<{ hasAccess: boolean }>> {
    if (!slug) {
      return {
        status: HttpStatus.BAD_REQUEST,
        hasAccess: false,
        message: 'No slug provided'
      };
    }

    const workspace = await this.workspaceRepository.findOne({ slug });
    const isMembershipExists = await this.workspaceMembershipRepository.isExists({
      userId: user.id,
      workspaceId: workspace.id
    });

    return {
      status: HttpStatus.OK,
      hasAccess: isMembershipExists
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
