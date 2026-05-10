import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { ContactType } from '@app/common/enums/conjoint';
import { z } from 'zod';

const CONTACT_SCHEMA = {
  type: z.nativeEnum(ContactType),
  phone: z.string().optional(),
  email: z.string().optional(),
  account: z.string().optional(),
  nickname: z.string().optional(),
};

registerCollectionTools({
  service: 'conjoint',
  collection: 'contacts',
  entityName: 'ConjointContact',
  serviceDoc: 'docs://service/conjoint-specification',
  inputSchema: { ...CONTACT_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...CONTACT_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.conjoint.contacts,
});
