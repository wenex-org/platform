import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { GrantType, Status } from '@app/common/core/enums';
import { AppType } from '@app/common/enums/domain';
import { Scope } from '@app/common/core';
import { z } from 'zod';

const CHANGE_LOG_SCHEMA = {
  code: z.string().optional(),
  semver: z.string(),
  changes: z.array(z.string()),
  deprecation_date: z.string().optional(),
  ...CORE_INPUT_SCHEMA,
};

const APP_SCHEMA = {
  type: z.nativeEnum(AppType),
  cid: z.string(),
  name: z.string().optional(),
  status: z.nativeEnum(Status),
  url: z.string().optional(),
  logo: z.string().optional(),
  site: z.string().optional(),
  slogan: z.string().optional(),
  scopes: z.array(z.nativeEnum(Scope)).optional(),
  grant_types: z.array(z.nativeEnum(GrantType)).optional(),
  access_token_ttl: z.number().optional(),
  refresh_token_ttl: z.number().optional(),
  change_logs: z.array(z.object(CHANGE_LOG_SCHEMA)).optional(),
};

registerCollectionTools({
  service: 'domain',
  collection: 'apps',
  entityName: 'DomainApp',
  serviceDoc: 'docs://service/domain-specification',
  inputSchema: { ...APP_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...APP_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.domain.apps,
});
