import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ChannelScope, ChannelType } from '@app/common/enums/conjoint';
import { State, Status } from '@app/common/core/enums';
import { z } from 'zod';

const CHANNEL_SCHEMA = {
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

registerCollectionTools({
  service: 'conjoint',
  collection: 'channels',
  entityName: 'ConjointChannel',
  serviceDoc: 'docs://service/conjoint-specification',
  inputSchema: { ...CHANNEL_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CHANNEL_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.conjoint.channels,
});
