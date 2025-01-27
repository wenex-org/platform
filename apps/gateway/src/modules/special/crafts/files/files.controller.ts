import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileDataSerializer, FileItemsSerializer, FileSerializer } from '@app/common/serializers/special';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateFileDto, CreateFileItemsDto, UpdateFileDto } from '@app/common/dto/special';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { SpecialProvider } from '@app/common/providers/special';
import { File, FileDto } from '@app/common/interfaces/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('files')
@ApiTags(Collection.Files)
@Controller(Collection.Files)
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesController extends ControllerClass<File, FileDto> implements IController<File, FileDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.files, FileSerializer);
  }

  @Get('count')
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  override create(@Meta() meta: Metadata, @Body() data: CreateFileDto): Observable<FileDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: FileItemsSerializer })
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateFileItemsDto): Observable<FileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiResponse({ type: FileItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<File>): Observable<FileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: FileSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<File>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<File>): Observable<FileDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<File>): Observable<FileDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<File>): Observable<FileDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<File>): Observable<FileDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<File>,
    @Body() update: UpdateFileDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @ApiResponse({ type: FileDataSerializer })
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Body() update: UpdateFileDto,
  ): Observable<FileDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
