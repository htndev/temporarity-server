import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from './../common/constants/role.constant';
import { GrantWorkspaceExistence } from './../common/decorators/grant-workspace-existence.decorator';
import { WorkspaceRoles } from './../common/decorators/workspace-roles.decorator';
import { JwtAccessTokenGuard } from './../common/guards/jwt-access-token.guard';
import { WorkspaceAccessGuard } from './../common/guards/workspace-access.guard';
import { CreateWorkspaceRouteDto } from './entities/create-workspace-route.dto';
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
}
