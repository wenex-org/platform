import { Module } from '@nestjs/common';

import { SagasResolver } from './sagas.resolver';
import { SagasController } from './sagas.controller';
import { SagaHistoriesModule } from './subs/histories';

@Module({
  imports: [SagaHistoriesModule],
  controllers: [SagasController],
  providers: [SagasResolver],
})
export class SagasModule {}
