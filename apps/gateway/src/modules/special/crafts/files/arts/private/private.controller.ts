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
import { SpecialProvider } from '@app/common/providers';
import { Metadata } from '@app/common/interfaces';
import { CreateFileDto } from '@app/common/dto';
import { Meta } from '@app/common/decorators';

@ApiTags('files')
@Controller('files')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class PrivateController {
  constructor(readonly provider: SpecialProvider) {}

  @Post('upload/private')
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
    return this.provider.files.upload(files, { meta });
  }
}
