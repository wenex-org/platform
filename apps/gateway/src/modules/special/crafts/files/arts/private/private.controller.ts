import { Controller, Post, UploadedFiles, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Audit, Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FileItemsSerializer, FileSerializer } from '@app/common/serializers/special';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { deepCopy, mapToInstance } from '@app/common/core/utils';
import { SpecialProvider } from '@app/common/providers/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { lookup, Modeler } from 'naming-conventions-modeler';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { CreateFileDto } from '@app/common/dto/special';
import { Metadata } from '@app/common/core/interfaces';
import { Meta } from '@app/common/core/decorators';
import { from, Observable } from 'rxjs';

const COLL_PATH = COLLECTION('files', 'special');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@ApiTags('special', 'files')
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PrivateController {
  constructor(readonly provider: SpecialProvider) {}

  @Post('upload/private')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @ApiConsumes('multipart/form-data')
  @SetScope(Scope.UploadSpecialFiles)
  @ApiResponse({ type: FileItemsSerializer })
  @SetPolicy(Action.Upload, Resource.SpecialFiles)
  @UseInterceptors(FilesInterceptor('file'), ...WriteInterceptors)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  upload(@Meta() meta: Metadata, @UploadedFiles() items: CreateFileDto[]): Observable<FileItemsSerializer> {
    items = deepCopy(Modeler.convert(Modeler.build(items, 'snake_case')));
    items = lookup(items, { fieldname: 'field', originalname: 'original' });
    return from(this.provider.files.upload(items, { meta })).pipe(mapToInstance(FileSerializer, 'items'));
  }
}
