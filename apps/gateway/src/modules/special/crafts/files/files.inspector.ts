import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ParseResizePipe, ParseRotatePipe, Resize, Rotate, ValidationPipe } from '@app/common/pipes';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { GatewayInterceptors } from '@app/common/interceptors';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { sdkStreamMixin } from '@smithy/util-stream';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { toString } from '@app/common/utils';
import { Request, Response } from 'express';
import { MD5 } from '@app/common/helpers';
import sharp from 'sharp';

import { FilesService } from './files.service';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Files)
@Controller(Collection.Files)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesInspector {
  constructor(readonly service: FilesService) {}

  @Get('download/:id')
  @SetScope(Scope.DownloadSpecialFiles)
  @SetPolicy(Action.Download, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'multipart/form-data' })
  async download(
    @Param('id', ParseIdPipe) id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Meta() meta: Metadata,
    @Query('ref', ParseRefPipe) ref?: string,
    @Query('rotate', ParseRotatePipe) rotate?: Rotate,
    @Query('resize', ParseResizePipe) resize?: Resize,
  ) {
    const { data, file } = await this.service.download({ id, ref }, { meta });

    const ETag = resize || rotate ? MD5.hash(file.etag + toString({ rotate, resize })) : file.etag;

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
