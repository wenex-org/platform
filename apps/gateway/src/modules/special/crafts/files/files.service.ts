import { FILE_SHARE_LINK_PREFIX, shareLinKey } from '@app/common/utils/special';
import { assertion, decode, get, isAvailable } from '@app/common/core/utils';
import { Query, ServiceOptions } from '@app/common/core/interfaces/mongo';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpecialProvider } from '@app/common/providers/special';
import { MINIO_CONFIG } from '@app/common/core/envs';
import { RedisService } from '@app/module/redis';
import { AES } from '@app/common/core/helpers';

import { PrivateService, PublicService } from './arts';

const { PUBLIC_STORAGE, PRIVATE_STORAGE } = MINIO_CONFIG();

@Injectable()
export class FilesService {
  constructor(
    readonly provider: SpecialProvider,

    private readonly redisService: RedisService,
    private readonly publicService: PublicService,
    private readonly privateService: PrivateService,
  ) {}

  async download(query: Query<File>, options: ServiceOptions & { validate?: boolean } = {}) {
    if (options.validate) {
      const authorization = get('authorization', options.meta);
      assertion(authorization, 'authorization token is required');

      const [token, secret] = authorization.split(':');
      const { key } = shareLinKey('*', token);
      try {
        const keys = await this.redisService.keys(key);
        if (!keys.length) throw new Error('invalid token');
        const value = await this.redisService.get(keys[0]);
        const fileId = keys[0].split(FILE_SHARE_LINK_PREFIX).pop();
        if (value) assertion(value === (secret ?? ''), 'invalid key');
        assertion(fileId && fileId.includes(query.id), 'invalid token');
      } catch (error) {
        if (error instanceof HttpException) throw error;
        try {
          const [fileId] = AES.decrypt(decode([token, secret].join('.'))).split(':');
          assertion(query.id === fileId, 'invalid token', HttpStatus.NOT_ACCEPTABLE);
        } catch (error) {
          if (error instanceof HttpException) throw error;
          throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
        }
      }
    }

    const file = await this.provider.files.findOne({ query }, options);
    assertion(file?.id && isAvailable(file), 'File not found', HttpStatus.NOT_FOUND);

    if (file.bucket === PUBLIC_STORAGE.bucket) {
      return { data: await this.publicService.getObject(file), file };
    } else if (file.bucket === PRIVATE_STORAGE.bucket) {
      return { data: await this.privateService.getObject(file), file };
    } else throw new Error('unknown bucket');
  }
}
