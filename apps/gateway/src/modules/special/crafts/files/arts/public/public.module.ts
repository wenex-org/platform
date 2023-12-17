import { MulterModule } from '@nestjs/platform-express';
import { File, FileSchema } from '@app/common/schemas';
import { PUBLIC_BUCKET } from '@app/common/consts';
import { MINIO_CONFIG } from '@app/common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import * as multerS3 from 'multer-s3';

import { PublicController } from './public.controller';

const { PUBLIC_STORAGE } = MINIO_CONFIG();

@Module({
  imports: [
    MulterModule.register({ storage: multerS3(PUBLIC_STORAGE) }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [PublicController],
  providers: [
    {
      provide: PUBLIC_BUCKET,
      useValue: PUBLIC_STORAGE.s3,
    },
  ],
})
export class PublicModule {}
