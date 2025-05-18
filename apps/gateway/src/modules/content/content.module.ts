import { ContentProvider, ContentProviderModule } from '@app/common/providers/content';
import { Global, Module } from '@nestjs/common';

import { NotesModule } from './crafts/notes';
import { PostsModule } from './crafts/posts';
import { TicketsModule } from './crafts/tickets';

@Global()
@Module({
  imports: [ContentProviderModule.forRoot(), ...[NotesModule, PostsModule, TicketsModule]],
  providers: [ContentProvider],
  exports: [ContentProvider],
})
export class ContentModule {}
