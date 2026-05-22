import { Module } from '@nestjs/common';

import { SagasResolver } from './sagas.resolver';
import { SagasController } from './sagas.controller';

import { SagaStagesModule } from './arts/stages';

@Module({
  imports: [SagaStagesModule],
  controllers: [SagasController],
  providers: [SagasResolver],
})
export class SagasModule {}
