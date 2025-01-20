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
import { SmsDataSerializer, SmsItemsSerializer, SmsSerializer } from '@app/common/serializers/touch';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSmsDto, CreateSmsItemsDto, UpdateSmsDto } from '@app/common/dto/touch';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Sms, SmsDto } from '@app/common/interfaces/touch';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('smss')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Smss)
@Controller(Collection.Smss)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SmssController extends ControllerClass<Sms, SmsDto> implements IController<Sms, SmsDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.smss, SmsSerializer);
  }

  @Get('count')
  @Cache(Collection.Smss, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Create, Resource.TouchSmss)
  override create(@Meta() meta: Metadata, @Body() data: CreateSmsDto): Observable<SmsDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SmsItemsSerializer })
  @SetPolicy(Action.Create, Resource.TouchSmss)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSmsItemsDto): Observable<SmsItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Smss, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiResponse({ type: SmsItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: SmsSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Sms>) {
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
  @Cache(Collection.Smss, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Sms>): Observable<SmsDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Delete, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Restore, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Destroy, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Sms>): Observable<SmsDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Sms>,
    @Body() update: UpdateSmsDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Smss, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @ApiResponse({ type: SmsDataSerializer })
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sms>,
    @Body() update: UpdateSmsDto,
  ): Observable<SmsDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
