import { JwtStrategy } from './../common/constants/auth.constant';
import { SecurityConfig } from './../common/providers/config/security.config';
import { UserRepository } from './../common/db/repositories/user.repository';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';

export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, JwtStrategy.Access) {
  constructor(
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    securityConfig: SecurityConfig
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfig.jwtAccessTokenSecret
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
