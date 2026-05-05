import {
  ServerMCP,
  throwableToolCall,
  CORE_INPUT_SCHEMA,
  CORE_OUTPUT_SCHEMA,
  mcpInputSchema,
  mcpOutputSchema,
  TOTAL_SCHEMA,
  ITEMS_SCHEMA,
} from '@app/common/core/mcp';
import { CreateStatDto, UpdateStatDto } from '@app/common/dto/special';
import { StatKey, StatType } from '@app/common/enums/special';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { Stat } from '@app/common/interfaces/special';
import { z, ZodType } from 'zod/v4';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type StatSchema = Record<keyof Stat, ZodType>;

const STAT_SCHEMA: Partial<StatSchema> = {
  type: z.enum(StatType),
  key: z.enum(StatKey),

  obj: z.any().optional(),
  flag: z.any().optional(),

  day: z.number().optional(),
  month: z.number().optional(),
  year: z.number(),

  hours: z.array(z.number()).optional(),
  days: z.array(z.number()).optional(),
  months: z.array(z.number()).optional(),
};

const STAT_INPUT_SCHEMA: Partial<StatSchema> = { ...STAT_SCHEMA, ...CORE_INPUT_SCHEMA };
const STAT_OUTPUT_SCHEMA: Partial<StatSchema> = { ...STAT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count SpecialStat

mcp.server.registerTool(
  'count_special_stats',
  {
    title: 'Count SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_special_stats', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.special.stats.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create SpecialStat

mcp.server.registerTool(
  'create_special_stats',
  {
    title: 'Create SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ body: STAT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_special_stats', http?.req, args);

      const payload = args.body as CreateStatDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.special.stats.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Stat with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk SpecialStat

mcp.server.registerTool(
  'create-bulk_special_stats',
  {
    title: 'Create Bulk SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(STAT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(STAT_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_special_stats', http?.req, args);

      const payload = args.body as { items: CreateStatDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.special.stats.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find SpecialStat

mcp.server.registerTool(
  'find_special_stats',
  {
    title: 'Find SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(STAT_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_special_stats', http?.req, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.special.stats.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One SpecialStat

mcp.server.registerTool(
  'find-one_special_stats',
  {
    title: 'Find One SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_special_stats', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.stats.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Stat found successfully.` : `Stat not found.` }],
      };
    }),
);

// Delete One SpecialStat

mcp.server.registerTool(
  'delete-one_special_stats',
  {
    title: 'Delete One SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_special_stats', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.stats.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Stat deleted (soft) successfully.` }],
      };
    }),
);

// Restore One SpecialStat

mcp.server.registerTool(
  'restore-one_special_stats',
  {
    title: 'Restore One SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_special_stats', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.stats.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Stat restored successfully.` }],
      };
    }),
);

// Destroy One SpecialStat

mcp.server.registerTool(
  'destroy-one_special_stats',
  {
    title: 'Destroy One SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_special_stats', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.stats.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Stat destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk SpecialStat

mcp.server.registerTool(
  'update-bulk_special_stats',
  {
    title: 'Update Bulk SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: STAT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_special_stats', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateStatDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.special.stats.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One SpecialStat

mcp.server.registerTool(
  'update-one_special_stats',
  {
    title: 'Update One SpecialStat',
    description: `Read "docs://service/special-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: STAT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: STAT_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_special_stats', http?.req, args);

      const payload = args.body as UpdateStatDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.special.stats.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Stat updated successfully.` }],
      };
    }),
);
