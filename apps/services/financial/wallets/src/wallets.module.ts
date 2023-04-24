import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
