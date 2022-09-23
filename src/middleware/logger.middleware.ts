import { Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

const logger = new Logger('Request');

export class RequestLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: () => void): void {
    logger.verbose(`Incoming ${request.method}: ${request.originalUrl}`);
    next();
  }
}
