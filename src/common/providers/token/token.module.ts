import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
