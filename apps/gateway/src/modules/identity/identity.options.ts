import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { APP, LOADER_OPTIONS } from '@app/common/consts';
import { join } from 'path';

const { IDENTITY } = APP;

export const clientsModuleOptions: ClientsModuleOptions = {
  clients: [
    {
      // Identity Services
      name: IDENTITY.PACKAGE.SYMBOL,
      transport: Transport.GRPC,
      options: {
        loader: LOADER_OPTIONS,
        package: IDENTITY.PACKAGE.NAME,
        url: `0.0.0.0:${IDENTITY.GRPC_PORT}`,
        protoPath: join(__dirname, 'modules/identity/identity.proto'),
      },
    },
  ],
};
