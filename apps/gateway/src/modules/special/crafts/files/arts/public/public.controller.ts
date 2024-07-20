import { Controller, Post, UploadedFiles, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
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
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';
import { CreateFileDto } from '@app/common/dto';
import { Meta } from '@app/common/decorators';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PublicController {
  constructor(readonly provider: SpecialProvider) {}

  @Post('upload/public')
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
  upload(@Meta() meta: Metadata, @UploadedFiles() files: CreateFileDto[]): Promise<FileSerializer[]> {
    return this.provider.files.upload(files, meta);
  }
}
