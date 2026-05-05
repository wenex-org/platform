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
import { CreateSmsDto, UpdateSmsDto } from '@app/common/dto/touch';
import { SmsProvider, SmsType } from '@app/common/enums/touch';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { Sms } from '@app/common/interfaces/touch';
import { z, ZodType } from 'zod/v4';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type SmsSchema = Record<keyof Sms, ZodType>;

const SMS_SCHEMA: Partial<SmsSchema> = {
  provider: z.enum(SmsProvider),

  type: z.enum(SmsType).optional(),

  message: z.string().optional(),
  template: z.string().optional(),
  parameters: z.array(z.string()).optional(),
  receptors: z.array(z.string()),
  sender: z.string().optional(),
  res: z.any().optional(),
};

const SMS_INPUT_SCHEMA: Partial<SmsSchema> = { ...SMS_SCHEMA, ...CORE_INPUT_SCHEMA };
const SMS_OUTPUT_SCHEMA: Partial<SmsSchema> = { ...SMS_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count TouchSms

mcp.server.registerTool(
  'count_touch_smss',
  {
    title: 'Count TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_touch_smss', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.touch.smss.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create TouchSms

mcp.server.registerTool(
  'create_touch_smss',
  {
    title: 'Create TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: SMS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_touch_smss', http?.req, args);

      const payload = args.body as CreateSmsDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.smss.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sms with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk TouchSms

mcp.server.registerTool(
  'create-bulk_touch_smss',
  {
    title: 'Create Bulk TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(SMS_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SMS_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_touch_smss', http?.req, args);

      const payload = args.body as { items: CreateSmsDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.smss.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find TouchSms

mcp.server.registerTool(
  'find_touch_smss',
  {
    title: 'Find TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(SMS_OUTPUT_SCHEMA) }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_touch_smss', http?.req, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.touch.smss.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One TouchSms

mcp.server.registerTool(
  'find-one_touch_smss',
  {
    title: 'Find One TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_touch_smss', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.smss.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Sms found successfully.` : `Sms not found.` }],
      };
    }),
);

// Delete One TouchSms

mcp.server.registerTool(
  'delete-one_touch_smss',
  {
    title: 'Delete One TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_touch_smss', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.smss.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sms deleted (soft) successfully.` }],
      };
    }),
);

// Restore One TouchSms

mcp.server.registerTool(
  'restore-one_touch_smss',
  {
    title: 'Restore One TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_touch_smss', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.smss.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sms restored successfully.` }],
      };
    }),
);

// Destroy One TouchSms

mcp.server.registerTool(
  'destroy-one_touch_smss',
  {
    title: 'Destroy One TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_touch_smss', http?.req, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.smss.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sms destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk TouchSms

mcp.server.registerTool(
  'update-bulk_touch_smss',
  {
    title: 'Update Bulk TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: SMS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_touch_smss', http?.req, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateSmsDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.touch.smss.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One TouchSms

mcp.server.registerTool(
  'update-one_touch_smss',
  {
    title: 'Update One TouchSms',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: SMS_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: SMS_OUTPUT_SCHEMA }),
  },
  async (args, { http }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_touch_smss', http?.req, args);

      const payload = args.body as UpdateSmsDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.smss.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Sms updated successfully.` }],
      };
    }),
);
