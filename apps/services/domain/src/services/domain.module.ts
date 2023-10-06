import { Module } from '@nestjs/common';
import { Services/domainController } from './services/domain.controller';
import { Services/domainService } from './services/domain.service';

@Module({
  imports: [],
  controllers: [Services/domainController],
  providers: [Services/domainService],
})
export class Services/domainModule {}
