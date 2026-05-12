import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ChannelScope, ChannelType } from '@app/common/enums/conjoint';
import { Channel } from '@app/common/interfaces/conjoint';
import { State, Status } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type ChannelSchema = Record<keyof Channel, ZodType>;
const CHANNEL_SCHEMA: Partial<ChannelSchema> = {
  type: z.nativeEnum(ChannelType),
  scope: z.nativeEnum(ChannelScope),

  name: z.string().optional(),
  title: z.string().optional(),

  state: z.nativeEnum(State).optional(),
  status: z.nativeEnum(Status).optional(),

  profile: z.string().optional(),
  account: z.string().optional(),
  pinned_messages: z.array(z.string()).optional(),
};

const CHANNEL_INPUT_SCHEMA: Partial<ChannelSchema> = { ...CHANNEL_SCHEMA, ...CORE_INPUT_SCHEMA };
const CHANNEL_OUTPUT_SCHEMA: Partial<ChannelSchema> = { ...CHANNEL_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'conjoint',
  collection: 'channels',
  entityName: 'ConjointChannel',
  inputSchema: CHANNEL_INPUT_SCHEMA,
  outputSchema: CHANNEL_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/conjoint-specification',
  getRestfulService: (platform) => platform.conjoint.channels,
});
