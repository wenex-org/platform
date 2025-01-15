import { PRIVATE_BUCKET } from '@app/common/utils/special';
import { MulterModule } from '@nestjs/platform-express';
import { MINIO_CONFIG } from '@app/common/core/envs';
import { Module } from '@nestjs/common';
import multerS3 from 'multer-s3';

import { PrivateService } from './private.service';
import { PrivateController } from './private.controller';

const { PRIVATE_STORAGE } = MINIO_CONFIG();

@Module({
  imports: [MulterModule.register({ storage: multerS3(PRIVATE_STORAGE) })],
  controllers: [PrivateController],
  providers: [
    {
      provide: PRIVATE_BUCKET,
      useValue: PRIVATE_STORAGE.s3,
    },
    PrivateService,
  ],
  exports: [PrivateService],
})
export class PrivateModule {}
