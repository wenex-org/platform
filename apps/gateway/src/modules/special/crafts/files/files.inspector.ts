import {
  Body,
  Controller,
  Get,
  HttpStatus,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors } from '@app/common/interceptors';
import { Action, Resource, Scope } from '@app/common/enums';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { Meta, Session } from '@app/common/decorators';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';
import { CreateFileDto } from '@app/common/dto';
import { ClientSession } from 'mongoose';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesInspector {
  constructor(readonly provider: SpecialProvider) {}

  @Get('download/:id')
  @SetScope(Scope.DownloadSpecialFiles)
  @SetPolicy(Action.Download, Resource.SpecialFiles)
  @ApiResponse({
    status: HttpStatus.OK,
    content: { 'multipart/form-data': { schema: { type: 'string', format: 'binary' } } },
  })
  async download(
    @Meta() meta: Metadata,
    @Body() items: CreateFileDto[],
    @Session() session?: ClientSession,
  ) {
    return { meta, items, session } as any;
    // const { obj, file } = await this.service.download({ id, ref });
    // res.set({
    //   'Content-Type': file.mimetype,
    //   'Content-Disposition': `attachment; filename="${file.original}"`,
    // });
    // return sdkStreamMixin(obj.pipe(map((res: any) => res.Body))).pipe(res);
  }
}
