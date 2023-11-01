import { Module } from '@nestjs/common';

import { UsersModule } from './crafts/users';

@Module({
  imports: [UsersModule],
})
export class IdentityModule {}
