import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from '../constants/auth.constant';

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard(JwtStrategy.Refresh) {}
