import { WorkspaceRouteAuthorizationRepository } from './../common/db/repositories/workspace-route-authorization.repository';
import { WorkspaceRouteRepository } from './../common/db/repositories/workspace-route.repository';
import { WorkspaceRoute } from './../common/db/entities/workspace-route.entity';
import { BadRequestException, ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { In, ObjectID } from 'typeorm';
import { EMAIL_INVITATION_TEMPLATE } from '../common/constants/email.constant';
import { Role } from '../common/constants/role.constant';
import { Workspace as WorkspaceEntity } from '../common/db/entities/workspace.entity';
import { UserRepository } from '../common/db/repositories/user.repository';
import { WorkspaceInvitationRepository } from '../common/db/repositories/workspace-invitation.repository';
import { WorkspaceMembershipRepository } from '../common/db/repositories/workspace-membership.repository';
import { WorkspaceRoleRepository } from '../common/db/repositories/workspace-role.repository';
import { WorkspaceRepository } from '../common/db/repositories/workspace.repository';
import { AppConfig } from '../common/providers/config/app.config';
import { EmailService } from '../common/providers/email/email.service';
import { SecurityProvider } from '../common/providers/security/security.service';
import { SafeUser } from '../common/types/auth.type';
import { HttpResponse } from '../common/types/response.type';
import { WorkspaceMember, WorkspaceRoutesShortTemplate, WorkspaceWithDetails } from '../common/types/workspace.type';
import { SafeWorkspace } from '../common/types/workspaces.type';
import { redirect } from '../common/utils/redirect.util';
import { WorkspaceRoutesTemplateRepository } from './../common/db/repositories/workspace-routes-template.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ExcludeUserFromWorkspaceDto } from './dto/exclude-user-from-workspace.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly emailService: EmailService,
    private readonly securityProvider: SecurityProvider,
    private readonly userRepository: UserRepository,
    private readonly workspaceInvitationRepository: WorkspaceInvitationRepository,
    private readonly workspaceMembershipRepository: WorkspaceMembershipRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRouteRepository: WorkspaceRouteRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRoutesTemplateRepository: WorkspaceRoutesTemplateRepository,
    private readonly workspaceRouteAuthorizationRepository: WorkspaceRouteAuthorizationRepository
  ) {}

  async create({ name, slug, description, template }: CreateWorkspaceDto, user: SafeUser) {
    const workspaceWithSlugExists = await this.workspaceRepository.isExists({ slug });

    if (workspaceWithSlugExists) {
      throw new ConflictException('Workspace with this slug already exists');
    }

    const userId = await this.userRepository.retrieveId({ email: user.email });

    const workspace = await this.workspaceRepository.create({
      name,
      slug,
      description,
      apiKey: await this.securityProvider.encrypt(`${userId}-${Date.now()}-${slug}`)
    });

    await workspace.save();

    const workspaceMembership = this.workspaceMembershipRepository.create({
      workspaceId: workspace._id,
      userId: userId,
      role: await this.workspaceRoleRepository.getOwnerRoleId()
    });

    await workspaceMembership.save();

    if (template) {
      const workspaceTemplate = await this.workspaceRoutesTemplateRepository.findOne({ where: { keyword: template } });

      if (workspaceTemplate) {
        await Promise.all(
          workspaceTemplate.routes.map(async (route) => {
            const workspaceRoute = await this.workspaceRouteRepository.createRoute(
              workspace._id,
              route.path,
              route.methods,
              route.status,
              route.responseType,
              route.response
            );

            await workspaceRoute.save();

            const authorization = await this.workspaceRouteAuthorizationRepository.findOne({
              where: { routeId: workspaceRoute._id }
            });

            authorization.strategy = route.authorization.strategy;
            authorization.payload = route.authorization.payload;

            await authorization.save();
          })
        );
      }
    }

    return {
      status: HttpStatus.CREATED
    };
  }

  async findAll(user: SafeUser): Promise<HttpResponse<{ workspaces: Workspace[] }>> {
    const userId = await this.userRepository.retrieveId({ email: user.email });
    const userMemberships = await this.workspaceMembershipRepository.find({ where: { userId: userId } });
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

  async getWorkspace(slug: string): Promise<HttpResponse<{ workspace: WorkspaceWithDetails }>> {
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

  async getTemplates(): Promise<HttpResponse<{ templates: WorkspaceRoutesShortTemplate[] }>> {
    const templates = await this.workspaceRoutesTemplateRepository.getGeneralTemplates();

    return {
      status: HttpStatus.OK,
      message: 'Templates retrieved successfully',
      templates
    };
  }

  async inviteUsers(slug: string, inviteUsersDto: InviteUsersDto, currentUser: SafeUser): Promise<HttpResponse> {
    if (!inviteUsersDto.emails.length) {
      throw new BadRequestException('No emails provided');
    }

    const userId = await this.userRepository.retrieveId({ email: currentUser.email });
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const role = await this.getRole(workspace._id, userId);

    if (role.name !== Role.Owner) {
      throw new BadRequestException('Only owner can invite new members to the workspace.');
    }

    const registeredUsers = await this.userRepository.find({
      where: {
        email: In(inviteUsersDto.emails)
      }
    });

    const notMembers = await Promise.all(
      registeredUsers.map(async (user) => {
        const membershipRecord = await this.workspaceMembershipRepository.getUserMembership(workspace._id, user._id);

        return { user, hasMembership: !!membershipRecord };
      })
    ).then((members) => members.filter((member) => !member.hasMembership).map((member) => member.user));

    await Promise.all(
      notMembers.map(async (user) => {
        const existingWorkspaceInvitation = await this.workspaceInvitationRepository.findOne({
          where: {
            userId: user._id,
            workspaceId: workspace._id
          }
        });

        if (existingWorkspaceInvitation) {
          await existingWorkspaceInvitation.remove();
        }

        const newWorkspaceInvitation = this.workspaceInvitationRepository.create({
          userId: user._id,
          inviteCode: await this.workspaceInvitationRepository.generateInviteCode(),
          workspaceId: workspace._id
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

  async excludeMember(slug: string, excludeUserFromWorkspaceDto: ExcludeUserFromWorkspaceDto): Promise<HttpResponse> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    const userId = await this.userRepository.retrieveId({ email: excludeUserFromWorkspaceDto.email });

    if (!userId) {
      throw new NotFoundException(
        `User with email ${excludeUserFromWorkspaceDto.email} not found in '${slug}' workspace.`
      );
    }

    const membershipRecord = await this.workspaceMembershipRepository.getUserMembership(workspace._id, userId);

    if (!membershipRecord) {
      throw new NotFoundException(`User ${excludeUserFromWorkspaceDto.email} is not a member of '${slug}' workspace.`);
    }

    await membershipRecord.remove();

    return {
      status: HttpStatus.ACCEPTED,
      message: 'User excluded successfully'
    };
  }

  async acceptInvite(slug: string, inviteCode: string, response: Response): Promise<HttpResponse> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace is not found');
    }

    const workspaceInvitation = await this.workspaceInvitationRepository.findOne({
      where: {
        workspaceId: workspace._id,
        inviteCode
      }
    });

    if (!workspaceInvitation) {
      throw new NotFoundException('Invitation is not found');
    }

    const user = await this.userRepository.findOne({ where: { _id: workspaceInvitation.userId } });

    const newMembership = this.workspaceMembershipRepository.create({
      workspaceId: workspace._id,
      userId: user._id,
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

  private async getWorkspaceMembership(slug: string): Promise<WorkspaceMember[]> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);
    const workspaceMembership = await this.workspaceMembershipRepository.find({
      where: { workspaceId: workspace._id }
    });
    const workspaceUsers = await this.userRepository.safeFindUsers(workspaceMembership.map((wm) => wm.userId));

    const usersWithRoles = await Promise.all(
      workspaceUsers.map(async (wu) => {
        const userId = await this.userRepository.retrieveId({ email: wu.email });
        const record = await this.workspaceMembershipRepository.getUserMembership(workspace._id, userId);
        const role = await this.workspaceRoleRepository.findOne({ where: { _id: record.role } });

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

    return await this.workspaceRoleRepository.findOne({ where: { _id: membership.role } });
  }

  private async canAccessWorkspace(slug: string, userEmail: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.getWorkspaceBySlug(slug);

    if (!workspace) {
      return false;
    }

    const user = await this.userRepository.findOne({ where: { email: userEmail } });
    const hasAccess = await this.workspaceMembershipRepository.isExists({
      workspaceId: workspace._id,
      userId: user._id
    });

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
