import { Module } from '@nestjs/common';

import { BranchesResolver } from './branches.resolver';
import { BranchesController } from './branches.controller';

@Module({
  controllers: [BranchesController],
  providers: [BranchesResolver],
})
export class BranchesModule {}
