import { NestMiddleware } from '@nestjs/common';

export class DisableCorsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    console.log('Request...', '???');
    console.log(req.header('origin'));
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Origin', req.header('origin'));
    next();
  }
}
