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
import { SettingDataSerializer, SettingItemsSerializer, SettingSerializer } from '@app/common/serializers/context';
import { CreateSettingDto, CreateSettingItemsDto, UpdateSettingDto } from '@app/common/dto/context';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Setting, SettingDto } from '@app/common/interfaces/context';
import { ContextProvider } from '@app/common/providers/context';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('settings')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Settings)
@Controller(Collection.Settings)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SettingsController extends ControllerClass<Setting, SettingDto> implements IController<Setting, SettingDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.settings, SettingSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadContextSettings)
  @Cache(Collection.Settings, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteContextSettings)
  @Cache(Collection.Settings, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Create, Resource.ContextSettings)
  override create(@Meta() meta: Metadata, @Body() data: CreateSettingDto): Observable<SettingDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteContextSettings)
  @Cache(Collection.Settings, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SettingItemsSerializer })
  @SetPolicy(Action.Create, Resource.ContextSettings)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSettingItemsDto): Observable<SettingItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadContextSettings)
  @Cache(Collection.Settings, 'fill')
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @ApiResponse({ type: SettingItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Setting>): Observable<SettingItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadContextSettings)
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: SettingSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Setting>) {
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
  @SetScope(Scope.ReadContextSettings)
  @Cache(Collection.Settings, 'fill')
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Read, Resource.ContextSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Setting>): Observable<SettingDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteContextSettings)
  @Cache(Collection.Settings, 'flush')
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Delete, Resource.ContextSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Setting>): Observable<SettingDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteContextSettings)
  @Cache(Collection.Settings, 'flush')
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Restore, Resource.ContextSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Setting>): Observable<SettingDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageContextSettings)
  @Cache(Collection.Settings, 'flush')
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Destroy, Resource.ContextSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Setting>): Observable<SettingDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageContextSettings)
  @Cache(Collection.Settings, 'flush')
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Setting>,
    @Body() update: UpdateSettingDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteContextSettings)
  @Cache(Collection.Settings, 'flush')
  @ApiResponse({ type: SettingDataSerializer })
  @SetPolicy(Action.Update, Resource.ContextSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Body() update: UpdateSettingDto,
  ): Observable<SettingDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
