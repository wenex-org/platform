import { Module } from '@nestjs/common';
import { WebpushController } from './webpush.controller';
import { WebpushService } from './webpush.service';

@Module({
  imports: [],
  controllers: [WebpushController],
  providers: [WebpushService],
})
export class WebpushModule {}
