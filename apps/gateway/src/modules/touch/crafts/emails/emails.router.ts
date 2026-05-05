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
import { CreateEmailDto, UpdateEmailDto } from '@app/common/dto/touch';
import { Email, EmailSmtp } from '@app/common/interfaces/touch';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Filter } from '@app/common/core/interfaces/mongo';
import { EmailProvider } from '@app/common/enums/touch';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

const SMTP_SCHEMA: Record<keyof EmailSmtp, ZodType> = {
  response: z.string(),
  accepted: z.array(z.string()).optional(),
  rejected: z.array(z.string()).optional(),

  message_id: z.string(),
  message_time: z.number(),
  message_size: z.number(),
};

type EmailSchema = Record<keyof Email, ZodType>;

const EMAIL_SCHEMA: Partial<EmailSchema> = {
  provider: z.nativeEnum(EmailProvider),

  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),

  from: z.string(),
  subject: z.string(),

  html: z.string().optional(),
  text: z.string().optional(),

  date: z.string().optional(),
  reply_to: z.array(z.string()).optional(),
  in_reply_to: z.string().optional(),

  attachments: z.array(z.any()).optional(),

  smtp: z.object(SMTP_SCHEMA).optional(),
};

const EMAIL_INPUT_SCHEMA: Partial<EmailSchema> = { ...EMAIL_SCHEMA, ...CORE_INPUT_SCHEMA };
const EMAIL_OUTPUT_SCHEMA: Partial<EmailSchema> = { ...EMAIL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count TouchEmail

mcp.server.registerTool(
  'count_touch_emails',
  {
    title: 'Count TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_touch_emails', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.touch.emails.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create TouchEmail

mcp.server.registerTool(
  'create_touch_emails',
  {
    title: 'Create TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: EMAIL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_touch_emails', requestInfo, args);

      const payload = args.body as CreateEmailDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.emails.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Email with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk TouchEmail

mcp.server.registerTool(
  'create-bulk_touch_emails',
  {
    title: 'Create Bulk TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(EMAIL_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EMAIL_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_touch_emails', requestInfo, args);

      const payload = args.body as { items: CreateEmailDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.touch.emails.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find TouchEmail

mcp.server.registerTool(
  'find_touch_emails',
  {
    title: 'Find TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(EMAIL_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_touch_emails', requestInfo, args);

      const filter = (args.filter ?? {}) as Filter;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.touch.emails.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One TouchEmail

mcp.server.registerTool(
  'find-one_touch_emails',
  {
    title: 'Find One TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_touch_emails', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.emails.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Email found successfully.` : `Email not found.` }],
      };
    }),
);

// Delete One TouchEmail

mcp.server.registerTool(
  'delete-one_touch_emails',
  {
    title: 'Delete One TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_touch_emails', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.emails.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Email deleted (soft) successfully.` }],
      };
    }),
);

// Restore One TouchEmail

mcp.server.registerTool(
  'restore-one_touch_emails',
  {
    title: 'Restore One TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_touch_emails', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.emails.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Email restored successfully.` }],
      };
    }),
);

// Destroy One TouchEmail

mcp.server.registerTool(
  'destroy-one_touch_emails',
  {
    title: 'Destroy One TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_touch_emails', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.emails.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Email destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk TouchEmail

mcp.server.registerTool(
  'update-bulk_touch_emails',
  {
    title: 'Update Bulk TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: EMAIL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_touch_emails', requestInfo, args);

      const query = args.filter?.['query'] ?? {};
      const payload = args.body as UpdateEmailDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.touch.emails.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One TouchEmail

mcp.server.registerTool(
  'update-one_touch_emails',
  {
    title: 'Update One TouchEmail',
    description: `Read "docs://service/touch-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: EMAIL_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: EMAIL_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_touch_emails', requestInfo, args);

      const payload = args.body as UpdateEmailDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = (args.params ?? {}) as { id?: string; ref?: string };
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.touch.emails.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Email updated successfully.` }],
      };
    }),
);
