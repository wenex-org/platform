import { Controller, Get, HttpStatus, Query, Req, Res, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseResizePipe, ParseRotatePipe, Resize, Rotate } from '@app/common/core/pipes/sharp';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { GatewayInterceptors } from '@app/common/core/interceptors';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { QueryFilterDto } from '@app/common/core/dto/mongo';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { sdkStreamMixin } from '@smithy/util-stream';
import { toString } from '@app/common/core/utils';
import { Hash } from '@app/common/core/helpers';
import { Request, Response } from 'express';
import sharp from 'sharp';

import { FilesService } from './files.service';

@ApiBearerAuth()
@RateLimit('files')
@ApiTags(Collection.Files)
@Controller(Collection.Files)
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesInspector {
  constructor(readonly service: FilesService) {}

  @Get('download/:id')
  @SetScope(Scope.DownloadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Download, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'multipart/form-data' })
  async download(
    @Req() req: Request,
    @Res() res: Response,
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Query('rotate', ParseRotatePipe) rotate?: Rotate,
    @Query('resize', ParseResizePipe) resize?: Resize,
  ) {
    const { data, file } = await this.service.download(filter.query, { meta });
    const ETag = resize || rotate ? Hash.md5(file.etag + toString({ rotate, resize })) : file.etag;
    if (file.acl?.toLocaleLowerCase().includes('public')) {
      res.status(HttpStatus.OK).set({
        ETag,
        'Content-Type': file.content_type,
        'Content-Disposition': `attachment; filename="${file.original}"`,
      });
    } else {
      res.status(HttpStatus.OK).set({
        'Content-Type': file.content_type,
        'Cache-Control': 'private, no-cache, no-store',
        'Content-Disposition': `attachment; filename="${file.original}"`,
      });
    }

    if (req.header('if-none-match') === ETag) {
      res.status(HttpStatus.NOT_MODIFIED).end();
    } else {
      if (file.content_type?.startsWith('image') && (resize || rotate)) {
        let sh: sharp.Sharp = sharp();
        if (resize) sh = sh.resize({ ...resize });
        if (rotate) sh = sh.rotate(rotate.angle, { background: rotate.background });
        sdkStreamMixin(data.Body).pipe(sh).pipe(res);
      } else sdkStreamMixin(data.Body).pipe(res);
    }
  }
}
