import { File, Query, ServiceOptions } from '@app/common/interfaces';
import { HttpStatus, Injectable } from '@nestjs/common';
import { expect, isAvailable } from '@app/common/utils';
import { SpecialProvider } from '@app/common/providers';
import { MINIO_CONFIG } from '@app/common/configs';

import { PrivateService, PublicService } from './arts';

const { PUBLIC_STORAGE, PRIVATE_STORAGE } = MINIO_CONFIG();

@Injectable()
export class FilesService {
  constructor(
    readonly provider: SpecialProvider,

    private readonly publicService: PublicService,
    private readonly privateService: PrivateService,
  ) {}

  async download(query: Query<File>, options?: ServiceOptions) {
    const file = await this.provider.files.findOne({ query }, options);

    expect(!file?.id && isAvailable(file), 'File not found', HttpStatus.NOT_FOUND);

    if (file.bucket === PUBLIC_STORAGE.bucket) {
      return { data: this.publicService.getObject(file), file };
    } else if (file.bucket === PRIVATE_STORAGE.bucket) {
      return { data: this.privateService.getObject(file), file };
    } else throw new Error('unknown bucket');
  }
}
