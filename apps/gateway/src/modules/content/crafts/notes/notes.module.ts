import { Module } from '@nestjs/common';

import './notes.router';
import { NotesResolver } from './notes.resolver';
import { NotesController } from './notes.controller';

@Module({
  controllers: [NotesController],
  providers: [NotesResolver],
})
export class NotesModule {}
