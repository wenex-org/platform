import {
  Controller,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Action, Resource, Scope } from '@app/common/enums';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FileSerializer } from '@app/common/serializers';
import { SpecialProvider } from '@app/common/providers';
import { Meta, Session } from '@app/common/decorators';
import { Metadata } from '@app/common/interfaces';
import { CreateFileDto } from '@app/common/dto';
import { ClientSession } from 'mongoose';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PrivateController {
  constructor(readonly provider: SpecialProvider) {}

  @Post('upload/private')
  @ShipStrategy('create')
  @SetScope(Scope.UploadSpecialFiles)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(...WriteInterceptors)
  @UseInterceptors(FilesInterceptor('file'))
  @SetPolicy(Action.Upload, Resource.SpecialFiles)
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
    @Session() session?: ClientSession,
  ): Promise<FileSerializer[]> {
    return this.provider.files.upload(files, { meta, session });
  }
}
