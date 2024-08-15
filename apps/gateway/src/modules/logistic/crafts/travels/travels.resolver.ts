import { CreateTravelDto, CreateTravelItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateTravelDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, TravelDataSerializer, TravelItemsSerializer, TravelSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Travel, TravelDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => TravelSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TravelsResolver extends ControllerClass<Travel, TravelDto> implements ControllerInterface<Travel, TravelDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.travels, () => TravelSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('travels', 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  countTravel(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => TravelDataSerializer)
  @ShipStrategy('create')
  @Cache('travels', 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  createTravel(
    @Meta() meta: Metadata,
    @Args('data') data: CreateTravelDto,
    @Session() session?: ClientSession,
  ): Observable<TravelDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => TravelItemsSerializer)
  @ShipStrategy('create')
  @Cache('travels', 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  createBulkTravel(
    @Meta() meta: Metadata,
    @Args() data: CreateTravelItemsDto,
    @Session() session?: ClientSession,
  ): Observable<TravelItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Query(() => TravelItemsSerializer)
  @Cache('travels', 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findTravel(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Travel>,
    @Session() session?: ClientSession,
  ): Observable<TravelItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => TravelDataSerializer)
  @Cache('travels', 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneTravel(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => TravelDataSerializer)
  @Cache('travels', 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Delete, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneTravel(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => TravelDataSerializer)
  @Cache('travels', 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Restore, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneTravel(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => TravelDataSerializer)
  @Cache('travels', 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @SetPolicy(Action.Destroy, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneTravel(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => TravelDataSerializer)
  @ShipStrategy('update')
  @Cache('travels', 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneTravel(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Args('data') update: UpdateTravelDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('travels', 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkTravel(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Travel>,
    @Args('data') update: UpdateTravelDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
