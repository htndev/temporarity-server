import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from '../constants/auth.constant';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard(JwtStrategy.Access) {}
