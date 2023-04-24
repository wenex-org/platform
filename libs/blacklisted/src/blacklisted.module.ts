import { Module } from '@nestjs/common';
import { BlacklistedService } from './blacklisted.service';

@Module({
  providers: [BlacklistedService],
  exports: [BlacklistedService],
})
export class BlacklistedModule {}
