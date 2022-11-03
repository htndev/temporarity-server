import { HttpMethod } from './../common/types/workspace-route.type';
import { GrantWorkspaceGuard } from './../common/guards/grant-workspace.guard';
import { All, Body, Controller, Headers, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TemporarityApiKeyGuard } from '../common/guards/temporarity-api-key.guard';
import { RoutesService } from './routes.service';
import { RequestMethod } from '../common/decorators/request-method.decorator';

@UseGuards(TemporarityApiKeyGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @UseGuards(GrantWorkspaceGuard)
  @All(':slug/*')
  incomingRequest(
    @Param('slug') slug: string,
    @Query() query: Record<string, unknown>,
    @Body() body: any,
    @Headers() headers: Record<string, unknown>,
    @Req() request: Request,
    @RequestMethod() method: HttpMethod
  ) {
    return this.routesService.incomingRequest({ slug, query, body, headers, request, method });
  }
}
