import { z } from 'zod';
import { Action, Resource } from '@app/common/core';
import { isCron, isNetAdd, isSubject } from '@app/common/core/decorators/validation';

export const GRANT_DATA_DICTIONARY = `
  subject: User email receiving the grant. Use as name for a grant.
  action: Permission action (e.g., read:share).
  object: Target resource type.
  field: Controls INPUT data (Write/Update access). Defines properties the subject can modify via 'notation' syntax (dot-notation).
  filter: Controls OUTPUT data (Read access). Defines properties the subject can see in the response via 'notation' syntax (dot-notation).
  location: List of network addresses (IP/CIDR) allowed to access this resource.
  time: List of time rules defining when the grant is active. Each item contains a cron schedule and duration.
  cron_exp: Cron expression that defines when the grant becomes active.
  duration: Duration of the grant in seconds.
`.trim();

const GRANT_TIME_SCHEMA = z.object({
  cron_exp: z
    .string()
    .trim()
    .refine((val) => isCron(val), { message: 'cron_exp must be a valid cron expression' })
    .describe(
      `REQUIRED. Cron expression that defines when the grant becomes active.
      If not provided, DO NOT call this tool, you MUST ask the user.`,
    ),
  duration: z
    .number()
    .positive()
    .describe('REQUIRED. Duration of the grant in seconds. If not provided, DO NOT call this tool, you MUST ask the user.'),
});

export const GRANT_INPUT_SCHEMA_FIELDS = {
  subject: z
    .string()
    .trim()
    .min(1)
    .refine((val) => isSubject(val), { message: 'Invalid subject' })
    .describe('REQUIRED. User email receiving the grant. If not provided, DO NOT call this tool, you MUST ask the user.'),
  action: z
    .nativeEnum(Action)
    .describe('REQUIRED. Permission action (e.g., read:share). If not provided, DO NOT call this tool, you MUST ask the user.'),
  object: z
    .nativeEnum(Resource)
    .describe('REQUIRED. Target resource type. If not provided, DO NOT call this tool, you MUST ask the user.'),
  field: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls INPUT data (Write/Update access) via 'notation' syntax.
        Examples: ['*'] (All), ['*', '!role'] (All except role), ['status'] (Only status).
        Leave empty if not explicitly requested.`,
    ),
  filter: z
    .array(z.string().trim())
    .optional()
    .describe(
      `OPTIONAL. Controls OUTPUT data (Read access) via 'notation' syntax.
        Examples: ['*'] (All), ['*', '!password'] (All except password).
        Leave empty if not explicitly requested.`,
    ),
  location: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => isNetAdd(val), {
          message: 'Each location must be a valid IP address or CIDR notation.',
        }),
    )
    .optional()
    .describe(
      `OPTIONAL. List of network addresses (IP/CIDR) allowed to access this resource.
      Leave empty if not explicitly requested.`,
    ),
  time: z.array(GRANT_TIME_SCHEMA).optional().describe(`OPTIONAL. List of time rules defining when the grant is active.
    Leave empty if not explicitly requested.`),
};

export const GRANT_OUTPUT_SCHEMA_FIELDS = {
  subject: z.string().optional().describe('User email receiving the grant.'),
  action: z.string().optional().describe('Permission action.'),
  object: z.string().optional().describe('Target resource type.'),
  field: z.array(z.string()).optional(),
  filter: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  time: z
    .array(
      z.object({
        cron_exp: z.string().optional(),
        duration: z.number().optional(),
      }),
    )
    .optional(),
};
