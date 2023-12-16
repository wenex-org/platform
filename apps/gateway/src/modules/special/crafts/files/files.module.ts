import { SpecialProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { FilesResolver } from './files.resolver';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [SpecialProvider, FilesResolver],
})
export class FilesModule {}
