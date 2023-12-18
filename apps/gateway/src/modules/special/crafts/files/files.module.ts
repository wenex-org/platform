import { Module } from '@nestjs/common';

import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { FilesInspector } from './files.inspector';
import { FilesController } from './files.controller';
import { PrivateModule, PublicModule } from './arts';

@Module({
  imports: [PublicModule, PrivateModule],
  controllers: [FilesController, FilesInspector],
  providers: [FilesService, FilesResolver],
})
export class FilesModule {}
