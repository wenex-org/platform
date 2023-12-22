import { TouchProviderModule } from '@app/common/providers';
import { Module } from '@nestjs/common';

import { MailsModule } from './crafts/mails';

@Module({
  imports: [TouchProviderModule, ...[MailsModule]],
})
export class TouchModule {}
