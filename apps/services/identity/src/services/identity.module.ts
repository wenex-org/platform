import { Module } from '@nestjs/common';
import { Services/identityController } from './services/identity.controller';
import { Services/identityService } from './services/identity.service';

@Module({
  imports: [],
  controllers: [Services/identityController],
  providers: [Services/identityService],
})
export class Services/identityModule {}
