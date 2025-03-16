import { TouchProvider, TouchProviderModule } from '@app/common/providers/touch';
import { Global, Module } from '@nestjs/common';

import { SmssModule } from './crafts/smss';
import { EmailsModule } from './crafts/emails';
import { PushesModule } from './crafts/pushes';

@Global()
@Module({
  imports: [TouchProviderModule.forRoot(), ...[SmssModule, EmailsModule, PushesModule]],
  providers: [TouchProvider],
  exports: [TouchProvider],
})
export class TouchModule {}
