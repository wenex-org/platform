import { registerCollectionTools, CORE_INPUT_SCHEMA, CORE_OUTPUT_SCHEMA } from '@app/common/core/mcp';
import { File } from '@app/common/interfaces/special';
import { State } from '@app/common/core/enums';
import { z, ZodType } from 'zod';

type FileSchema = Record<keyof File, ZodType>;
const FILE_SCHEMA: Partial<FileSchema> = {
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

const FILE_INPUT_SCHEMA: Partial<FileSchema> = { ...FILE_SCHEMA, ...CORE_INPUT_SCHEMA };
const FILE_OUTPUT_SCHEMA: Partial<FileSchema> = { ...FILE_SCHEMA, ...CORE_OUTPUT_SCHEMA };

// ------------------------------------------------------------
// Tools Implementation
// ------------------------------------------------------------

registerCollectionTools({
  service: 'special',
  collection: 'files',
  entityName: 'SpecialFile',
  inputSchema: FILE_INPUT_SCHEMA,
  outputSchema: FILE_OUTPUT_SCHEMA,
  serviceDoc: 'docs://service/special-specification',
  getRestfulService: (platform) => platform.special.files,
});
