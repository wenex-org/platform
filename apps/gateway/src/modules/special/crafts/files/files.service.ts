import { Query, ServiceOptions } from '@app/common/core/interfaces/mongo';
import { assertion, isAvailable } from '@app/common/core/utils';
import { SpecialProvider } from '@app/common/providers/special';
import { HttpStatus, Injectable } from '@nestjs/common';
import { MINIO_CONFIG } from '@app/common/core/envs';

import { PrivateService, PublicService } from './arts';

const { PUBLIC_STORAGE, PRIVATE_STORAGE } = MINIO_CONFIG();

@Injectable()
export class FilesService {
  constructor(
    readonly provider: SpecialProvider,

    private readonly publicService: PublicService,
    private readonly privateService: PrivateService,
  ) {}

  async download(query: Query<File>, options: ServiceOptions = {}) {
    const file = await this.provider.files.findOne({ query }, options);
    assertion(file?.id && isAvailable(file), 'File not found', HttpStatus.NOT_FOUND);

    if (file.bucket === PUBLIC_STORAGE.bucket) {
      return { data: await this.publicService.getObject(file), file };
    } else if (file.bucket === PRIVATE_STORAGE.bucket) {
      return { data: await this.privateService.getObject(file), file };
    } else throw new Error('unknown bucket');
  }

  async getUrl(query: Query<File>, options: ServiceOptions = {}) {
    const file = await this.provider.files.findOne({ query }, options);
    assertion(file?.id && isAvailable(file), 'File not found', HttpStatus.NOT_FOUND);

    if (file.bucket === PUBLIC_STORAGE.bucket) {
      return { data: await this.publicService.getShareLink(file), file };
    } else if (file.bucket === PRIVATE_STORAGE.bucket) {
      return { data: await this.privateService.getShareLink(file), file };
    } else throw new Error('unknown bucket');
  }
}
