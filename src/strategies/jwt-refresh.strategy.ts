import { SecurityConfig } from './../common/providers/config/security.config';
import { UserRepository } from './../common/db/repositories/user.repository';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';

export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
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
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Token is not valid');
    }

    return user;
  }
}
