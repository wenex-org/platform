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
import { CreateCargoDto, CreateCargoItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateCargoDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, CargoDataSerializer, CargoItemsSerializer, CargoSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Cargo, CargoDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { Filter, Meta } from '@app/common/decorators';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Cargoes)
@Controller(Collection.Cargoes)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CargoesController extends ControllerClass<Cargo, CargoDto> implements ControllerInterface<Cargo, CargoDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.cargoes, () => CargoSerializer);
  }

  @Get('count')
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  create(@Meta() meta: Metadata, @Body() data: CreateCargoDto): Observable<CargoDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateCargoItemsDto): Observable<CargoItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Cargo>): Observable<CargoItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: CargoSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Cargo>) {
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
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Delete, Resource.LogisticCargoes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Restore, Resource.LogisticCargoes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @SetPolicy(Action.Destroy, Resource.LogisticCargoes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Body() update: UpdateCargoDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Cargo>,
    @Body() update: UpdateCargoDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
