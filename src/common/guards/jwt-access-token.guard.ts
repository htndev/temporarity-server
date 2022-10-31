import { Injectable } from '@nestjs/common';
import { JwtStrategy } from '../constants/auth.constant';
import { AuthGuard } from './auth.guard';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard(JwtStrategy.Access) {}
