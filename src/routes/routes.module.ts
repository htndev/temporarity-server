import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceRouteResponse } from '../common/db/entities/workspace-route-response.entity';
import { WorkspaceRoute } from '../common/db/entities/workspace-route.entity';
import { Workspace } from '../common/db/entities/workspace.entity';
import { WorkspaceRouteResponseRepository } from '../common/db/repositories/workspace-route-response.repository';
import { WorkspaceRouteRepository } from '../common/db/repositories/workspace-route.repository';
import { WorkspaceRepository } from '../common/db/repositories/workspace.repository';
import { GeneratorProvider } from '../common/providers/generator.provider';
import { provideCustomRepository } from '../common/utils/db.util';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceRoute, WorkspaceRouteResponse])],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    GeneratorProvider,
    provideCustomRepository(Workspace, WorkspaceRepository),
    provideCustomRepository(WorkspaceRoute, WorkspaceRouteRepository),
    provideCustomRepository(WorkspaceRouteResponse, WorkspaceRouteResponseRepository)
  ]
})
export class RoutesModule {}
