import { TouchProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { PushModule } from './crafts/push';
import { MailsModule } from './crafts/mails';

@Module({
  imports: [TouchProviderModule.forRoot(), ...[PushModule, MailsModule]],
})
export class TouchModule {}
