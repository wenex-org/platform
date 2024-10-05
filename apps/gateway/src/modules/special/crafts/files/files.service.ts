import { QueryID, ServiceOptions } from '@app/common/interfaces';
import { HttpStatus, Injectable } from '@nestjs/common';
import { expect, isAvailable } from '@app/common/utils';
import { SpecialProvider } from '@app/common/providers';
import { MINIO_CONFIG } from '@app/common/envs';

import { PrivateService, PublicService } from './arts';

const { PUBLIC_STORAGE, PRIVATE_STORAGE } = MINIO_CONFIG();

@Injectable()
export class FilesService {
  constructor(
    readonly provider: SpecialProvider,

    private readonly publicService: PublicService,
    private readonly privateService: PrivateService,
  ) {}

  async download(query: QueryID, options?: ServiceOptions) {
    const file = await this.provider.files.findById({ query }, options);

    expect(file?.id && isAvailable(file), 'File not found', HttpStatus.NOT_FOUND);

    if (file.bucket === PUBLIC_STORAGE.bucket) {
      return { data: await this.publicService.getObject(file), file };
    } else if (file.bucket === PRIVATE_STORAGE.bucket) {
      return { data: await this.privateService.getObject(file), file };
    } else throw new Error('unknown bucket');
  }
}
