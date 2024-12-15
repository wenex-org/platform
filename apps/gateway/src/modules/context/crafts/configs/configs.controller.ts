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
import { ConfigDataSerializer, ConfigItemsSerializer, ConfigSerializer } from '@app/common/serializers/context';
import { CreateConfigDto, CreateConfigItemsDto, UpdateConfigDto } from '@app/common/dto/context';
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
import { Config, ConfigDto } from '@app/common/interfaces/context';
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
@RateLimit('configs')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Configs)
@Controller(Collection.Configs)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsController extends ControllerClass<Config, ConfigDto> implements IController<Config, ConfigDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.configs, ConfigSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadContextConfigs)
  @Cache(Collection.Configs, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  override create(@Meta() meta: Metadata, @Body() data: CreateConfigDto): Observable<ConfigDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ConfigItemsSerializer })
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateConfigItemsDto): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadContextConfigs)
  @Cache(Collection.Configs, 'fill')
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiResponse({ type: ConfigItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Config>): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ConfigSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Config>) {
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
  @SetScope(Scope.ReadContextConfigs)
  @Cache(Collection.Configs, 'fill')
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Config>): Observable<ConfigDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Delete, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Config>): Observable<ConfigDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Restore, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Config>): Observable<ConfigDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Destroy, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Config>): Observable<ConfigDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Config>,
    @Body() update: UpdateConfigDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteContextConfigs)
  @Cache(Collection.Configs, 'flush')
  @ApiResponse({ type: ConfigDataSerializer })
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Body() update: UpdateConfigDto,
  ): Observable<ConfigDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
