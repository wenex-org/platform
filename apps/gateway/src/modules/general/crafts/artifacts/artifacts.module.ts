import { Module } from '@nestjs/common';

import { ArtifactsResolver } from './artifacts.resolver';
import { ArtifactsController } from './artifacts.controller';

@Module({
  controllers: [ArtifactsController],
  providers: [ArtifactsResolver],
})
export class ArtifactsModule {}
