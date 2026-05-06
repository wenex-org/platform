import { Module } from '@nestjs/common';

import './posts.router';
import { PostsResolver } from './posts.resolver';
import { PostsController } from './posts.controller';

@Module({
  controllers: [PostsController],
  providers: [PostsResolver],
})
export class PostsModule {}
