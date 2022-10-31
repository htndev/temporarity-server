import { redirect } from './../common/utils/redirect.util';
import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID } from 'mongodb';
import { Role } from '../common/constants/role.constant';
import { EMAIL_INVITATION_TEMPLATE } from './../common/constants/email.constant';
import { Workspace as WorkspaceEntity } from './../common/db/entities/workspace.entity';
import { UserRepository } from './../common/db/repositories/user.repository';
import { WorkspaceInvitationRepository } from './../common/db/repositories/workspace-invitation.repository';
import { WorkspaceMembershipRepository } from './../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from './../common/db/repositories/workspace-role.repository';
import { WorkspaceRouteRequestRepository } from './../common/db/repositories/workspace-route-request.repository';
import { WorkspaceRouteResponseRepository } from './../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from './../common/db/repositories/workspace.repository';
import { AppConfig } from './../common/providers/config/app.config';
import { EmailService } from './../common/providers/email/email.service';
import { SecurityProvider } from './../common/providers/security/security.service';
import { SafeUser } from './../common/types/auth.type';
import { HttpResponse } from './../common/types/response.type';
import { WorkspaceMember, WorkspaceWithDetails } from './../common/types/workspace.type';
import { SafeWorkspace } from './../common/types/workspaces.type';
import { CreateWorkspaceRouteDto } from './dto/create-workspace-route.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
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
    @InjectRepository(WorkspaceRouteRepository) private readonly workspaceRouteRepository: WorkspaceRouteRepository,
    @InjectRepository(WorkspaceRouteRequestRepository)
    private readonly workspaceRouteRequestRepository: WorkspaceRouteRequestRepository,
    @InjectRepository(WorkspaceRouteResponseRepository)
    private readonly workspaceRouteResponseRepository: WorkspaceRouteResponseRepository,
    @InjectRepository(WorkspaceInvitationRepository)
    private readonly workspaceInvitationRepository: WorkspaceInvitationRepository,
    private readonly securityProvider: SecurityProvider,
    private readonly emailService: EmailService,
    private readonly appConfig: AppConfig
  ) {}

  async create({ name, slug, description }: CreateWorkspaceDto, user: SafeUser) {
    const workspaceWithSlugExists = await this.workspaceRepository.isExists({ slug });

    if (workspaceWithSlugExists) {
      throw new ConflictException('Workspace with this slug already exists');
    }

    const userId = await this.userRepository.getId({ email: user.email });

    const workspace = await this.workspaceRepository.create({
      name,
      slug,
      description,
      apiKey: await this.securityProvider.encrypt(`${userId}-${Date.now()}-${slug}`)
    });

    await workspace.save();

    const workspaceMembership = this.workspaceMembershipRepository.create({
      workspaceId: workspace.id,
      userId: userId,
      role: await this.workspaceRoleRepository.getOwnerRoleId()
    });

    await workspaceMembership.save();

    return {
      status: HttpStatus.CREATED
    };
  }

  async findAll(user: SafeUser): Promise<HttpResponse<{ workspaces: Workspace[] }>> {
    const userId = await this.userRepository.getId({ email: user.email });
    const userMemberships = await this.workspaceMembershipRepository.find({ userId: userId });
    const workspaces = await Promise.all(
      userMemberships.map(async (membership) => {
        const workspace = await this.workspaceRepository.getShortInformation(membership.workspaceId);
        const workspaceMembers = await this.getWorkspaceMembership(workspace.slug);

        return new Workspace(
          String(workspace.id),
          workspace.name,
          workspace.description,
          workspace.slug,
          workspaceMembers
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
      throw new BadRequestException('No slug provided');
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace is not found');
    }

    const hasAccessToWorkspace = await this.canAccessWorkspace(slug, user.email);

    if (!hasAccessToWorkspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      status: HttpStatus.OK,
      hasAccess: hasAccessToWorkspace
    };
  }

  async getWorkspace(slug: string, user: SafeUser): Promise<HttpResponse<{ workspace: WorkspaceWithDetails }>> {
    if (!(await this.canAccessWorkspace(slug, user.email))) {
      throw new NotFoundException('Workspace does not exist');
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    return {
      status: HttpStatus.OK,
      message: 'Workspace retrieved successfully',
      workspace: {
        ...this.mapSafeWorkspace(workspace),
        membership: await this.getWorkspaceMembership(slug)
      }
    };
  }

  async createRoute(slug: string, createWorkspaceRouteDto: CreateWorkspaceRouteDto, user: SafeUser) {
    if (!(await this.canAccessWorkspace(slug, user.email))) {
      throw new NotFoundException('Workspace does not exist');
    }

    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    const workspaceRoute = this.workspaceRouteRepository.create({
      workspaceId: workspace.id,
      path: createWorkspaceRouteDto.path,
      methods: createWorkspaceRouteDto.httpMethods,
      status: createWorkspaceRouteDto.status
    });

    await workspaceRoute.save();

    const workspaceRouteRequest = this.workspaceRouteRequestRepository.create({ routeId: workspaceRoute.id });

    await workspaceRouteRequest.save();

    const workspaceRouteResponse = this.workspaceRouteResponseRepository.create({ routeId: workspaceRoute.id });

    await workspaceRouteResponse.save();

    return {
      status: HttpStatus.CREATED
    };
  }

  async inviteUsers(slug: string, inviteUsersDto: InviteUsersDto, currentUser: SafeUser): Promise<HttpResponse> {
    if (!(await this.canAccessWorkspace(slug, currentUser.email))) {
      throw new NotFoundException('Workspace does not exist');
    }

    if (!inviteUsersDto.emails.length) {
      throw new BadRequestException('No emails provided');
    }

    const userId = await this.userRepository.getId({ email: currentUser.email });
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const role = await this.getRole(workspace.id, userId);

    if (role.name !== Role.Owner) {
      throw new BadRequestException('Only owner can invite new members to the workspace.');
    }

    const registeredUsers = await this.userRepository.find({
      where: {
        email: {
          $in: inviteUsersDto.emails
        }
      }
    });

    const notMembers = await Promise.all(
      registeredUsers.map(async (user) => {
        const membershipRecord = await this.workspaceMembershipRepository.getUserMembership(workspace.id, user.id);

        return { user, hasMembership: !!membershipRecord };
      })
    ).then((members) => members.filter((member) => !member.hasMembership).map((member) => member.user));

    await Promise.all(
      notMembers.map(async (user) => {
        const existingWorkspaceInvitation = await this.workspaceInvitationRepository.findOne({
          userId: user.id,
          workspaceId: workspace.id
        });

        if (existingWorkspaceInvitation) {
          await existingWorkspaceInvitation.remove();
        }

        const newWorkspaceInvitation = this.workspaceInvitationRepository.create({
          userId: user.id,
          inviteCode: await this.workspaceInvitationRepository.generateInviteCode(),
          workspaceId: workspace.id
        });

        await newWorkspaceInvitation.save();

        const letter = this.emailService.parseEmailTemplate(EMAIL_INVITATION_TEMPLATE, {
          workspaceName: workspace.name,
          fullName: user.fullName,
          workspaceUrl: `${this.appConfig.clientUrl}/workspaces/${workspace.slug}`,
          acceptUrl: `${this.appConfig.url}/workspaces/${workspace.slug}/accept-invite/${newWorkspaceInvitation.inviteCode}`
        });

        await this.emailService.sendEmail(user.email, 'You have been invited to a workspace', letter);
      })
    );

    return {
      status: HttpStatus.OK,
      message: 'Users invited successfully'
    };
  }

  async acceptInvite(slug: string, inviteCode: string, response: Response): Promise<HttpResponse> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace is not found');
    }

    const workspaceInvitation = await this.workspaceInvitationRepository.findOne({
      workspaceId: workspace.id,
      inviteCode
    });

    if (!workspaceInvitation) {
      throw new NotFoundException('Invite is not found');
    }

    const user = await this.userRepository.findOne(workspaceInvitation.userId);

    const newMembership = this.workspaceMembershipRepository.create({
      workspaceId: workspace.id,
      userId: user.id,
      role: await this.workspaceRoleRepository.getEditorRoleId()
    });

    await newMembership.save();

    await workspaceInvitation.remove();

    await redirect(response, `${this.appConfig.clientUrl}/workspaces/${workspace.slug}`);

    return {
      status: HttpStatus.MOVED_PERMANENTLY,
      message: 'Invite accepted'
    };
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }

  private async getWorkspaceMembership(slug: string): Promise<WorkspaceMember[]> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const workspaceMembership = await this.workspaceMembershipRepository.find({ workspaceId: workspace.id });
    const workspaceUsers = await this.userRepository.safeFindUsers(workspaceMembership.map((wm) => wm.userId));

    const usersWithRoles = await Promise.all(
      workspaceUsers.map(async (wu) => {
        const userId = await this.userRepository.getId({ email: wu.email });
        const record = await this.workspaceMembershipRepository.getUserMembership(workspace.id, userId);
        const role = await this.workspaceRoleRepository.findOne(record.role);

        return {
          ...wu,
          role: role.name
        };
      })
    );

    return usersWithRoles;
  }

  private async getRole(workspaceId: ObjectID, userId: ObjectID) {
    const membership = await this.workspaceMembershipRepository.getUserMembership(workspaceId, userId);

    return await this.workspaceRoleRepository.findOne(membership.role);
  }

  private async canAccessWorkspace(slug: string, userEmail: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      return false;
    }

    const user = await this.userRepository.findOne({ email: userEmail });
    const hasAccess = await this.workspaceMembershipRepository.isExists({ workspaceId: workspace.id, userId: user.id });

    return hasAccess;
  }

  private mapSafeWorkspace(workspace: WorkspaceEntity): SafeWorkspace {
    return {
      slug: workspace.slug,
      name: workspace.name,
      description: workspace.description,
      apiKey: workspace.apiKey,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    };
  }
}
