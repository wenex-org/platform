import { DomainProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { AppsResolver } from './apps.resolver';
import { AppsController } from './apps.controller';

@Module({
  controllers: [AppsController],
  providers: [DomainProvider, AppsResolver],
})
export class AppsModule {}
