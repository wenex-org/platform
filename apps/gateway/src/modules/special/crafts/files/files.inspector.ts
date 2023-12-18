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
import { AuthorityInterceptor, GatewayInterceptors } from '@app/common/interceptors';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Action, Resource, Scope } from '@app/common/enums';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { sdkStreamMixin } from '@smithy/util-stream';
import { Metadata } from '@app/common/interfaces';
import { QueryFilterDto } from '@app/common/dto';
import { Response } from 'express';

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
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Download, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'multipart/form-data' })
  async download(
    @Param('id', ParseIdPipe) id: string,
    @Res() res: Response,
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ) {
    refineFilterQuery(filter, { id, ref });
    const { data, file } = await this.service.download(filter.query, { meta });

    res.status(HttpStatus.OK).set({
      ETag: `"${file.etag}"`,
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.original}"`,
    });

    return sdkStreamMixin(data.Body).pipe(res);
  }
}
