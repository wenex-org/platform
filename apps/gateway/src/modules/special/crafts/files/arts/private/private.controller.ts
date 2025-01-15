import { Controller, Post, UploadedFiles, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FileItemsSerializer, FileSerializer } from '@app/common/serializers/special';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { SpecialProvider } from '@app/common/providers/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { CreateFileDto } from '@app/common/dto/special';
import { mapToInstance } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Meta } from '@app/common/core/decorators';
import { from, Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('files')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Files)
@Controller(Collection.Files)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PrivateController {
  constructor(readonly provider: SpecialProvider) {}

  @Post('upload/private')
  @ShipStrategy('create')
  @ApiConsumes('multipart/form-data')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.UploadSpecialFiles)
  @ApiResponse({ type: FileItemsSerializer })
  @SetPolicy(Action.Upload, Resource.SpecialFiles)
  @UseInterceptors(...WriteInterceptors, FilesInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  upload(@Meta() meta: Metadata, @UploadedFiles() items: CreateFileDto[]): Observable<FileItemsSerializer> {
    return from(this.provider.files.upload(items, { meta })).pipe(mapToInstance(FileSerializer, 'items'));
  }
}
