import { Module } from '@nestjs/common';

import './members.router';
import { MembersResolver } from './members.resolver';
import { MembersController } from './members.controller';

@Module({
  controllers: [MembersController],
  providers: [MembersResolver],
})
export class MembersModule {}
