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
import { CreateTravelDto, CreateTravelItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateTravelDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, TravelDataSerializer, TravelItemsSerializer, TravelSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Travel, TravelDto } from '@app/common/interfaces';
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
@ApiTags(Collection.Travels)
@Controller(Collection.Travels)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TravelsController extends ControllerClass<Travel, TravelDto> implements ControllerInterface<Travel, TravelDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.travels, () => TravelSerializer);
  }

  @Get('count')
  @Cache(Collection.Travels, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  create(@Meta() meta: Metadata, @Body() data: CreateTravelDto): Observable<TravelDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateTravelItemsDto): Observable<TravelItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Travels, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Travel>): Observable<TravelItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: TravelSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Travel>) {
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
  @Cache(Collection.Travels, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Delete, Resource.LogisticTravels)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Restore, Resource.LogisticTravels)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @SetPolicy(Action.Destroy, Resource.LogisticTravels)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Body() update: UpdateTravelDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Travels, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Travel>,
    @Body() update: UpdateTravelDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
