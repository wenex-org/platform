import { Module } from '@nestjs/common';

import { SagasResolver } from './sagas.resolver';
import { SagasInspector } from './sagas.inspector';
import { SagasController } from './sagas.controller';
import { SagaHistoriesModule } from './arts/histories';

@Module({
  imports: [SagaHistoriesModule],
  controllers: [SagasController, SagasInspector],
  providers: [SagasResolver],
})
export class SagasModule {}
