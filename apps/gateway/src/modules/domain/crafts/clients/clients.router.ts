import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ClientPlan, ClientServiceProvider, ClientServiceType } from '@app/common/enums/domain';
import { GrantType, State, Status } from '@app/common/core/enums';
import { Scope } from '@app/common/core';
import { z } from 'zod';

const DOMAIN_SCHEMA = {
  name: z.string(),
  status: z.nativeEnum(Status),
  ...CORE_INPUT_SCHEMA,
};

const SERVICE_SCHEMA = {
  type: z.nativeEnum(ClientServiceType),
  provider: z.nativeEnum(ClientServiceProvider),
  config: z.any(),
  ...CORE_INPUT_SCHEMA,
};

const CLIENT_SCHEMA = {
  name: z.string(),
  plan: z.nativeEnum(ClientPlan),
  url: z.string().optional(),
  logo: z.string().optional(),
  site: z.string().optional(),
  slogan: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),
  api_key: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  expiration_date: z.string().optional(),
  access_token_ttl: z.number().optional(),
  refresh_token_ttl: z.number().optional(),
  scopes: z.array(z.nativeEnum(Scope)),
  whitelist: z.array(z.string()).optional(),
  coworkers: z.array(z.string()).optional(),
  grant_types: z.array(z.nativeEnum(GrantType)),
  domains: z.array(z.object(DOMAIN_SCHEMA)).optional(),
  services: z.array(z.object(SERVICE_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'domain',
  collection: 'clients',
  entityName: 'DomainClient',
  serviceDoc: 'docs://service/domain-specification',
  inputSchema: { ...CLIENT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CLIENT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.domain.clients,
});
