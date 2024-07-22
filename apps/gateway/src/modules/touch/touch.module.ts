import { TouchProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { MailsModule } from './crafts/mails';
import { PushesModule } from './crafts/pushes';

@Module({
  imports: [TouchProviderModule.forRoot(), ...[MailsModule, PushesModule]],
})
export class TouchModule {}
