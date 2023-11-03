import { IdentityProvider, identityClientsModuleOptions } from '@app/common/providers';
import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';

import { ProfilesResolver } from './profiles.resolver';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [ClientsModule.register(identityClientsModuleOptions)],
  controllers: [ProfilesController],
  providers: [ProfilesResolver, IdentityProvider],
})
export class ProfilesModule {}
