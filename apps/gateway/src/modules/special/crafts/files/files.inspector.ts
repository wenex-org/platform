import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ParseIdPipe,
  ParseRefPipe,
  ParseResizePipe,
  ParseRotatePipe,
  Resize,
  Rotate,
  ValidationPipe,
} from '@app/common/pipes';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { GatewayInterceptors } from '@app/common/interceptors';
import { Action, Resource, Scope } from '@app/common/enums';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { sdkStreamMixin } from '@smithy/util-stream';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { toString } from '@app/common/utils';
import { MD5 } from '@app/common/helpers';
import { Response } from 'express';
import * as sharp from 'sharp';

import { FilesService } from './files.service';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
@UsePipes(ValidationPipe)
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
    @Res() res: Response,
    @Meta() meta: Metadata,
    @Query('ref', ParseRefPipe) ref?: string,
    @Query('rotate', ParseRotatePipe) rotate?: Rotate,
    @Query('resize', ParseResizePipe) resize?: Resize,
  ) {
    const { data, file } = await this.service.download({ id, ref }, { meta });

    const etag = MD5.hash(file.etag + toString({ rotate, resize }));
    res.status(HttpStatus.OK).set({
      ETag: `"${resize || rotate ? etag : file.etag}"`,
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.original}"`,
    });

    if (file.mimetype?.startsWith('image') && (resize || rotate)) {
      let sh: sharp.Sharp = sharp();

      if (resize) sh = sh.resize({ ...resize });
      if (rotate) sh = sh.rotate(rotate.angle, { background: rotate.background });

      return sdkStreamMixin(data.Body).pipe(sh).pipe(res);
    } else return sdkStreamMixin(data.Body).pipe(res);
  }
}
