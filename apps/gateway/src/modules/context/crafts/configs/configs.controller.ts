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
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ContextProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('configs')
@Controller('configs')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsController extends ControllerClass<Config, ConfigDto> implements ControllerInterface<Config, ConfigDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.configs, () => ConfigSerializer);
  }

  @Get('count')
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
    @Session() session?: ClientSession,
  ): Observable<ConfigDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  createBulk(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigItemsDto,
    @Session() session?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Get()
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter, session);
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
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Delete, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Restore, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('configs', 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Destroy, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Body() update: UpdateConfigDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('configs', 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Config>,
    @Body() update: UpdateConfigDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
