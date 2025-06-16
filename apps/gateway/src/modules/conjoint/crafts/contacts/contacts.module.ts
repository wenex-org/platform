import { Module } from '@nestjs/common';

import { ContactsResolver } from './contacts.resolver';
import { ContactsController } from './contacts.controller';

@Module({
  controllers: [ContactsController],
  providers: [ContactsResolver],
})
export class ContactsModule {}
