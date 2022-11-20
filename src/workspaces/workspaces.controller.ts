import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Role } from '../common/constants/role.constant';
import { GrantWorkspaceExistence } from '../common/decorators/grant-workspace-existence.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { WorkspaceRoles } from '../common/decorators/workspace-roles.decorator';
import { JwtAccessTokenGuard } from '../common/guards/jwt-access-token.guard';
import { WorkspaceAccessGuard } from '../common/guards/workspace-access.guard';
import { SafeUser } from '../common/types/auth.type';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ExcludeUserFromWorkspaceDto } from './dto/exclude-user-from-workspace.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { WorkspacesService } from './workspaces.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @User() user: SafeUser) {
    return this.workspacesService.create(createWorkspaceDto, user);
  }

  @Post('/:slug/invite')
  @WorkspaceRoles([Role.Owner])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  inviteUsers(@Param('slug') slug: string, @Body() inviteUsersDto: InviteUsersDto, @User() currentUser: SafeUser) {
    return this.workspacesService.inviteUsers(slug, inviteUsersDto, currentUser);
  }

  @Delete('/:slug/exclude')
  @WorkspaceRoles([Role.Owner])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  excludeMember(@Param('slug') slug: string, @Body() excludeUserFromWorkspaceDto: ExcludeUserFromWorkspaceDto) {
    return this.workspacesService.excludeMember(slug, excludeUserFromWorkspaceDto);
  }

  @Public()
  @GrantWorkspaceExistence()
  @Get('/:slug/accept-invite/:inviteCode')
  async acceptInvite(@Param('slug') slug: string, @Param('inviteCode') inviteCode: string, @Res() response: Response) {
    return this.workspacesService.acceptInvite(slug, inviteCode, response);
  }

  @Get()
  findAll(@User() user: SafeUser) {
    return this.workspacesService.findAll(user);
  }

  @Get('/has-access/:slug')
  hasAccess(@Param('slug') slug: string, @User() user: SafeUser) {
    return this.workspacesService.hasAccess(slug, user);
  }

  @Get(':slug')
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  getWorkspace(@Param('slug') slug: string) {
    return this.workspacesService.getWorkspace(slug);
  }
}
