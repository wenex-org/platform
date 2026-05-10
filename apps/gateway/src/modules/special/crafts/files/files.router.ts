import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { State } from '@app/common/core/enums';
import { z } from 'zod';

const FILE_SCHEMA = {
  field: z.string().optional(),
  title: z.string().optional(),
  state: z.nativeEnum(State).optional(),
  original: z.string(),
  encoding: z.string().optional(),
  mimetype: z.string(),
  size: z.number(),
  bucket: z.string(),
  key: z.string(),
  acl: z.string(),
  content_type: z.string().optional(),
  storage_class: z.string().optional(),
  location: z.string(),
  etag: z.string().optional(),
};

registerCollectionTools({
  service: 'special',
  collection: 'files',
  entityName: 'SpecialFile',
  serviceDoc: 'docs://service/special-specification',
  inputSchema: { ...FILE_SCHEMA, ...CORE_INPUT_SCHEMA },
  outputSchema: { ...FILE_SCHEMA, ...CORE_OUTPUT_SCHEMA },
  getCollection: (p) => p.special.files,
});
