import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { PUBLIC_DECORATOR_KEY } from '../decorators/public.decorator';

export const AuthGuard = (authToken: string) => {
  @Injectable()
  class AuthGuardClass extends PassportAuthGuard(authToken) {
    constructor(readonly reflector: Reflector) {
      super();
      this.reflector = reflector;
    }

    canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.get<boolean>(PUBLIC_DECORATOR_KEY, context.getHandler());

      if (isPublic) {
        return true;
      }

      return super.canActivate(context);
    }
  }

  return AuthGuardClass;
};
