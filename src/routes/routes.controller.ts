import { All, Body, Controller, Headers, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestMethod } from '../common/decorators/request-method.decorator';
import { TemporarityApiKeyGuard } from '../common/guards/temporarity-api-key.guard';
import { GrantWorkspaceGuard } from './../common/guards/grant-workspace.guard';
import { HttpMethod } from './../common/types/workspace-route.type';
import { RoutesService } from './routes.service';

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
    @Res() response: Response,
    @RequestMethod() method: HttpMethod
  ) {
    return this.routesService.incomingRequest({ slug, query, body, headers, request, method, response });
  }
}
