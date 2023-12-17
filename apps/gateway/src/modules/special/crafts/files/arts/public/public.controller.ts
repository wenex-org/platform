import {
  Controller,
  Post,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FileSerializer } from '@app/common/serializers';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';

import { CreateFileDto } from '../../dto';
import { PublicService } from './public.service';

@ApiTags('assets')
@Controller('assets')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Post('upload/public')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  upload(
    @Meta() meta: Metadata,
    @UploadedFiles() files: CreateFileDto[],
  ): Promise<FileSerializer[]> {
    return this.service.upload(files, { meta });
  }
}
