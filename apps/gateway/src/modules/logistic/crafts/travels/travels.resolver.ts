import { TravelDataSerializer, TravelItemsSerializer, TravelSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateTravelDto, CreateTravelItemsDto, UpdateTravelDto } from '@app/common/dto/logistic';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Travel, TravelDto } from '@app/common/interfaces/logistic';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { LogisticProvider } from '@app/common/providers/logistic';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('travels', 'logistic');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TravelsResolver extends ControllerClass<Travel, TravelDto> implements IController<Travel, TravelDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.travels, TravelSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  countLogisticTravel(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TravelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/travels', 'create')
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  createLogisticTravel(@Meta() meta: Metadata, @Args('data') data: CreateTravelDto): Observable<TravelDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TravelItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/travels', 'create')
  @SetPolicy(Action.Create, Resource.LogisticTravels)
  createLogisticTravelBulk(@Meta() meta: Metadata, @Args('data') data: CreateTravelItemsDto): Observable<TravelItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => TravelItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticTravel(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Travel>,
  ): Observable<TravelItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => TravelDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticTravels)
  @SetPolicy(Action.Read, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticTravelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TravelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Delete, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteLogisticTravelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TravelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @SetPolicy(Action.Restore, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreLogisticTravelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TravelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @SetPolicy(Action.Destroy, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyLogisticTravelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Travel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticTravels)
  @Validation('logistic/travels', 'update')
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticTravelBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateTravelDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Travel>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => TravelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticTravels)
  @Validation('logistic/travels', 'update')
  @SetPolicy(Action.Update, Resource.LogisticTravels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticTravelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Travel>,
    @Args('data') update: UpdateTravelDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TravelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
