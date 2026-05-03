import { Module } from '@nestjs/common';

import './wallets.router';
import { WalletsResolver } from './wallets.resolver';
import { WalletsController } from './wallets.controller';

@Module({
  controllers: [WalletsController],
  providers: [WalletsResolver],
})
export class WalletsModule {}
