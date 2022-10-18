import { SafeUser } from './../common/types/auth.type';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '../common/decorators/user.decorator';
import { JwtAccessTokenGuard } from './../common/guards/jwt-access-token.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
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

  @Get()
  findAll(@User() user: SafeUser) {
    return this.workspacesService.findAll(user);
  }

  @Get('/has-access/:slug')
  hasAccess(@Param('slug') slug: string, @User() user: SafeUser) {
    return this.workspacesService.hasAccess(slug, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(+id);
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
