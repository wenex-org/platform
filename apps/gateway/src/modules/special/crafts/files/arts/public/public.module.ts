import { SpecialProvider } from '@app/common/providers';
import { MulterModule } from '@nestjs/platform-express';
import { PUBLIC_BUCKET } from '@app/common/consts';
import { MINIO_CONFIG } from '@app/common/configs';
import { Module } from '@nestjs/common';
import * as multerS3 from 'multer-s3';

import { PublicService } from './public.service';
import { PublicController } from './public.controller';

const { PUBLIC_STORAGE } = MINIO_CONFIG();

@Module({
  imports: [MulterModule.register({ storage: multerS3(PUBLIC_STORAGE) })],
  controllers: [PublicController],
  providers: [
    {
      provide: PUBLIC_BUCKET,
      useValue: PUBLIC_STORAGE.s3,
    },
    PublicService,
    SpecialProvider,
  ],
  exports: [PublicService],
})
export class PublicModule {}
