import { Module } from '@nestjs/common';

import { AppsModule } from './crafts/apps';
import { ClientsModule } from './crafts/clients';

@Module({
  imports: [AppsModule, ClientsModule],
})
export class DomainModule {}
