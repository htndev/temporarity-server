import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: undefined, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
);
