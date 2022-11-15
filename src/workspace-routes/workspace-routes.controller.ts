import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from './../common/constants/role.constant';
import { GrantWorkspaceExistence } from './../common/decorators/grant-workspace-existence.decorator';
import { WorkspaceRoles } from './../common/decorators/workspace-roles.decorator';
import { JwtAccessTokenGuard } from './../common/guards/jwt-access-token.guard';
import { WorkspaceAccessGuard } from './../common/guards/workspace-access.guard';
import { CreateWorkspaceRouteDto } from './dto/create-workspace-route.dto';
import { UpdateRouteMethodsDto } from './dto/update-route-methods.dto';
import { UpdateRoutePathDto } from './dto/update-route-path.dto';
import { UpdateRouteStatusDto } from './dto/update-route-status.dto';
import { WorkspaceRoutesService } from './workspace-routes.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('workspace-routes/:slug')
export class WorkspaceRoutesController {
  constructor(private readonly workspaceRoutesService: WorkspaceRoutesService) {}

  @Get()
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceRoutes(@Param('slug') slug: string) {
    return this.workspaceRoutesService.getWorkspaceRoutes(slug);
  }

  @Post()
  @UseInterceptors(FileInterceptor('response'))
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  createRoute(
    @Param('slug') slug: string,
    @Body() createWorkspaceRouteDto: CreateWorkspaceRouteDto,
    @UploadedFile() file
  ) {
    return this.workspaceRoutesService.createRoute(slug, {
      ...createWorkspaceRouteDto,
      response: file ? file : createWorkspaceRouteDto.response
    });
  }

  @Get('details/:id')
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  getRouteDetails(@Param('slug') slug: string, @Param('id') id: string) {
    return this.workspaceRoutesService.getRouteDetails(slug, id);
  }

  @Patch('update/:id/methods')
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  updateRouteMethods(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() updateRouteMethodsDto: UpdateRouteMethodsDto
  ) {
    return this.workspaceRoutesService.updateRouteMethods(slug, id, updateRouteMethodsDto);
  }

  @Patch('update/:id/path')
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  updateRoutePath(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() updateRouteMethodsDto: UpdateRoutePathDto
  ) {
    return this.workspaceRoutesService.updateRoutePath(slug, id, updateRouteMethodsDto);
  }

  @Patch('update/:id/status')
  @WorkspaceRoles([Role.Owner, Role.Editor])
  @GrantWorkspaceExistence()
  @UseGuards(WorkspaceAccessGuard)
  updateRouteStatus(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() updateRouteMethodsDto: UpdateRouteStatusDto
  ) {
    return this.workspaceRoutesService.updateRouteStatus(slug, id, updateRouteMethodsDto);
  }
}
