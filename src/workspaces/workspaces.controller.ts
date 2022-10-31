import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { JwtAccessTokenGuard } from './../common/guards/jwt-access-token.guard';
import { SafeUser } from './../common/types/auth.type';
import { CreateWorkspaceRouteDto } from './dto/create-workspace-route.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @User() user: SafeUser) {
    return this.workspacesService.create(createWorkspaceDto, user);
  }

  @Post('/:slug')
  createRoute(
    @Param('slug') slug: string,
    @Body() createWorkspaceRoute: CreateWorkspaceRouteDto,
    @User() currentUser: SafeUser
  ) {
    return this.workspacesService.createRoute(slug, createWorkspaceRoute, currentUser);
  }

  @Post('/:slug/invite')
  inviteUsers(@Param('slug') slug: string, @Body() inviteUsersDto: InviteUsersDto, @User() currentUser: SafeUser) {
    return this.workspacesService.inviteUsers(slug, inviteUsersDto, currentUser);
  }

  @Public()
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
  getWorkspace(@Param('slug') slug: string, @User() currentUser: SafeUser) {
    return this.workspacesService.getWorkspace(slug, currentUser);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspacesService.update(+id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspacesService.remove(+id);
  }
}
