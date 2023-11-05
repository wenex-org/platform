import { Module } from '@nestjs/common';

import { GrantsModule } from './crafts/grants';

@Module({
  imports: [GrantsModule],
})
export class AuthModule {}
