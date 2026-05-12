import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { Contact } from '@app/common/interfaces/conjoint';
import { ContactType } from '@app/common/enums/conjoint';
import { z, ZodType } from 'zod';

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

registerCollectionTools({
  service: 'conjoint',
  collection: 'contacts',
  entityName: 'ConjointContact',
  inputSchema: CONTACT_INPUT_SCHEMA,
  outputSchema: CONTACT_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/conjoint-specification',
  getRestfulService: (platform) => platform.conjoint.contacts,
});
