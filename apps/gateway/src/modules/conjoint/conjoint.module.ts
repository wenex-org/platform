import { ConjointProvider, ConjointProviderModule } from '@app/common/providers/conjoint';
import { Global, Module } from '@nestjs/common';

import { MembersModule } from './crafts/members';
import { AccountsModule } from './crafts/accounts';
import { ChannelsModule } from './crafts/channels';
import { ContactsModule } from './crafts/contacts';
import { MessagesModule } from './crafts/messages';

@Global()
@Module({
  imports: [ConjointProviderModule.forRoot(), ...[AccountsModule, ChannelsModule, ContactsModule, MembersModule, MessagesModule]],
  providers: [ConjointProvider],
  exports: [ConjointProvider],
})
export class ConjointModule {}
