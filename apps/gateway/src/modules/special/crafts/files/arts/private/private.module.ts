import { MulterModule } from '@nestjs/platform-express';
import { File, FileSchema } from '@app/common/schemas';
import { PRIVATE_BUCKET } from '@app/common/consts';
import { MINIO_CONFIG } from '@app/common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import * as multerS3 from 'multer-s3';

import { PrivateController } from './private.controller';

const { PRIVATE_STORAGE } = MINIO_CONFIG();

@Module({
  imports: [
    MulterModule.register({ storage: multerS3(PRIVATE_STORAGE) }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [PrivateController],
  providers: [
    {
      provide: PRIVATE_BUCKET,
      useValue: PRIVATE_STORAGE.s3,
    },
  ],
})
export class PrivateModule {}
