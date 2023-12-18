import { MulterModule } from '@nestjs/platform-express';
import { SpecialProvider } from '@app/common/providers';
import { PRIVATE_BUCKET } from '@app/common/consts';
import { MINIO_CONFIG } from '@app/common/configs';
import { Module } from '@nestjs/common';
import * as multerS3 from 'multer-s3';

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
    SpecialProvider,
  ],
  exports: [PrivateService],
})
export class PrivateModule {}
