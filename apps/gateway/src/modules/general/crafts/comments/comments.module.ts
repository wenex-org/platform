import { Module } from '@nestjs/common';

import { CommentsResolver } from './comments.resolver';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [CommentsController],
  providers: [CommentsResolver],
})
export class CommentsModule {}
