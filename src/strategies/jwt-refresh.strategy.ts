import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtStrategy } from '../common/constants/auth.constant';
import { UserRepository } from '../common/db/repositories/user.repository';
import { SecurityConfig } from '../common/providers/config/security.config';

export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, JwtStrategy.Refresh) {
  constructor(
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    securityConfig: SecurityConfig
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfig.jwtRefreshTokenSecret
    });
  }

  async validate({ email }: { email: string }): Promise<any> {
    const user = await this.userRepository.safeFindUser({ email });

    if (!user) {
      throw new UnauthorizedException('Token is not valid');
    }

    return user;
  }
}
