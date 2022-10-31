import { Module } from '@nestjs/common';
import { SecurityProvider } from './security.service';

@Module({
  providers: [SecurityProvider],
  exports: [SecurityProvider]
})
export class SecurityModule {}
