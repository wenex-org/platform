import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CreateConfigDto, CreateConfigItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateConfigDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, ConfigDataSerializer, ConfigItemsSerializer, ConfigSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Config, ConfigDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ContextProvider } from '@app/common/providers';
import { Filter, Meta } from '@app/common/decorators';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Configs)
@Controller(Collection.Configs)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsController extends ControllerClass<Config, ConfigDto> implements ControllerInterface<Config, ConfigDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.configs, () => ConfigSerializer);
  }

  @Get('count')
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  create(@Meta() meta: Metadata, @Body() data: CreateConfigDto): Observable<ConfigDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateConfigItemsDto): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Config>): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ConfigSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Config>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getMessageEvent({ id: data.id, data })),
      error: (data) => res.end(getMessageEvent({ event: 'error', data })),
      complete: () => res.end(getMessageEvent({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Delete, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Restore, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Destroy, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Body() update: UpdateConfigDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Config>,
    @Body() update: UpdateConfigDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
