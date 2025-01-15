import { PUBLIC_BUCKET } from '@app/common/utils/special';
import { MulterModule } from '@nestjs/platform-express';
import { MINIO_CONFIG } from '@app/common/core/envs';
import { Module } from '@nestjs/common';
import multerS3 from 'multer-s3';

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
  ],
  exports: [PublicService],
})
export class PublicModule {}
