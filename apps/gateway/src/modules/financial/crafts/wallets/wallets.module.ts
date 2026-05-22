import { Module } from '@nestjs/common';

import { WalletsResolver } from './wallets.resolver';
import { WalletsController } from './wallets.controller';

@Module({
  controllers: [WalletsController],
  providers: [WalletsResolver],
})
export class WalletsModule {}
