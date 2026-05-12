import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ClientPlan, ClientServiceProvider, ClientServiceType } from '@app/common/enums/domain';
import { Client, ClientDomain, ClientService } from '@app/common/interfaces/domain';
import { GrantType, State, Status } from '@app/common/core/enums';
import { Scope } from '@app/common/core';
import { z, ZodType } from 'zod';

type ClientDomainSchema = Record<keyof ClientDomain, ZodType>;
const DOMAIN_SCHEMA: Partial<ClientDomainSchema> = {
  name: z.string(),
  status: z.nativeEnum(Status),

  ...CORE_INPUT_SCHEMA,
};

type ClientServiceSchema = Record<keyof ClientService, ZodType>;
const SERVICE_SCHEMA: Partial<ClientServiceSchema> = {
  type: z.nativeEnum(ClientServiceType),
  provider: z.nativeEnum(ClientServiceProvider),

  config: z.any(),

  ...CORE_INPUT_SCHEMA,
};

type ClientSchema = Record<keyof Client, ZodType>;
const CLIENT_SCHEMA: Partial<ClientSchema> = {
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

const CLIENT_INPUT_SCHEMA: Partial<ClientSchema> = { ...CLIENT_SCHEMA, ...CORE_INPUT_SCHEMA };
const CLIENT_OUTPUT_SCHEMA: Partial<ClientSchema> = { ...CLIENT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'domain',
  collection: 'clients',
  entityName: 'DomainClient',
  inputSchema: CLIENT_INPUT_SCHEMA,
  outputSchema: CLIENT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/domain-specification',
  getRestfulService: (platform) => platform.domain.clients,
});
