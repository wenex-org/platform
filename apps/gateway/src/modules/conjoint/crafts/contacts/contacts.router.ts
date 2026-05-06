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
import { CreateContactDto, UpdateContactDto } from '@app/common/dto/conjoint';
import { RequestConfig } from '@wenex/sdk/common/core/types';
import { Contact } from '@app/common/interfaces/conjoint';
import { ContactType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

const mcp = ServerMCP.create();

// ------------------------------------------------------------
// Shared Schemas
// ------------------------------------------------------------

type ContactSchema = Record<keyof Contact, ZodType>;

const CONTACT_SCHEMA: Partial<ContactSchema> = {
  type: z.nativeEnum(ContactType),

  phone: z.string().optional(),
  email: z.string().optional(),

  account: z.string().optional(),

  nickname: z.string().optional(),
};

const CONTACT_INPUT_SCHEMA: Partial<ContactSchema> = { ...CONTACT_SCHEMA, ...CORE_INPUT_SCHEMA };
const CONTACT_OUTPUT_SCHEMA: Partial<ContactSchema> = { ...CONTACT_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

// Count ConjointContact

mcp.server.registerTool(
  'count_conjoint_contacts',
  {
    title: 'Count ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('count_conjoint_contacts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('platform endpoint calling with query %o and config %o', query, config);

      const result = await mcp.platform.conjoint.contacts.count(query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `There are exactly ${result} items matching your criteria.` }],
      };
    }),
);

// Create ConjointContact

mcp.server.registerTool(
  'create_conjoint_contacts',
  {
    title: 'Create ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: CONTACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create_conjoint_contacts', requestInfo, args);

      const payload = args.body as CreateContactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.contacts.create(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Contact with id "${result.id}" created successfully.` }],
      };
    }),
);

// Create Bulk ConjointContact

mcp.server.registerTool(
  'create-bulk_conjoint_contacts',
  {
    title: 'Create Bulk ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ body: ITEMS_SCHEMA(CONTACT_INPUT_SCHEMA) }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CONTACT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('create-bulk_conjoint_contacts', requestInfo, args);

      const payload = args.body as { items: CreateContactDto[] };
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o and config %o', payload, config);

      const result = await mcp.platform.conjoint.contacts.createBulk(payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Successfully created ${result.length} items in bulk.` }],
      };
    }),
);

// Find ConjointContact

mcp.server.registerTool(
  'find_conjoint_contacts',
  {
    title: 'Find ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true }),
    outputSchema: mcpOutputSchema({ result: ITEMS_SCHEMA(CONTACT_OUTPUT_SCHEMA) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find_conjoint_contacts', requestInfo, args);

      const filter = args.filter ?? {};
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with filter %o and config %o', filter, config);

      const result = await mcp.platform.conjoint.contacts.find(filter, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { items: result } },
        content: [{ type: 'text', text: `Retrieves ${result.length ?? 0} items from services.` }],
      };
    }),
);

// Find One ConjointContact

mcp.server.registerTool(
  'find-one_conjoint_contacts',
  {
    title: 'Find One ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('find-one_conjoint_contacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.contacts.findById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: result ? `Contact found successfully.` : `Contact not found.` }],
      };
    }),
);

// Delete One ConjointContact

mcp.server.registerTool(
  'delete-one_conjoint_contacts',
  {
    title: 'Delete One ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('delete-one_conjoint_contacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.contacts.deleteById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Contact deleted (soft) successfully.` }],
      };
    }),
);

// Restore One ConjointContact

mcp.server.registerTool(
  'restore-one_conjoint_contacts',
  {
    title: 'Restore One ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('restore-one_conjoint_contacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.contacts.restoreById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Contact restored successfully.` }],
      };
    }),
);

// Destroy One ConjointContact

mcp.server.registerTool(
  'destroy-one_conjoint_contacts',
  {
    title: 'Destroy One ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('destroy-one_conjoint_contacts', requestInfo, args);

      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o and config %o', { id, ref }, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.contacts.destroyById(id || '-', config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Contact destroyed (hard) successfully.` }],
      };
    }),
);

// Update Bulk ConjointContact

mcp.server.registerTool(
  'update-bulk_conjoint_contacts',
  {
    title: 'Update Bulk ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ filter: true, body: CONTACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: TOTAL_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-bulk_conjoint_contacts', requestInfo, args);

      const query = args.filter?.query ?? {};
      const payload = args.body as UpdateContactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      logger('endpoint call with payload %o, query %o and config %o', payload, query, config);

      const result = await mcp.platform.conjoint.contacts.updateBulk(payload, query, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result: { total: result } },
        content: [{ type: 'text', text: `Successfully updated ${result} items in bulk.` }],
      };
    }),
);

// Update One ConjointContact

mcp.server.registerTool(
  'update-one_conjoint_contacts',
  {
    title: 'Update One ConjointContact',
    description: `Read "docs://service/conjoint-specification"`,
    inputSchema: mcpInputSchema({ params: true, body: CONTACT_INPUT_SCHEMA }),
    outputSchema: mcpOutputSchema({ result: CONTACT_OUTPUT_SCHEMA }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async (args, { requestInfo }) =>
    throwableToolCall(async () => {
      const [logger, headers] = mcp.utils('update-one_conjoint_contacts', requestInfo, args);

      const payload = args.body as UpdateContactDto;
      const config = { headers: { ...(args.headers ?? {}), ...headers } };
      const { id, ref } = args.params ?? ({} as { id?: string; ref?: string });
      logger('endpoint call with id and ref %o, payload %o and config %o', { id, ref }, payload, config);

      if (ref && (!id || id == '-')) (config as RequestConfig).params = { ref };
      const result = await mcp.platform.conjoint.contacts.updateById(id || '-', payload, config);
      logger('the structured content of result value after call is: %o', result);
      return {
        structuredContent: { result },
        content: [{ type: 'text', text: `Contact updated successfully.` }],
      };
    }),
);
