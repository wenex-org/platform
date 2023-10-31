import { IdentityProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';

@Module({ providers: [IdentityProvider] })
export class UsersModule {}
