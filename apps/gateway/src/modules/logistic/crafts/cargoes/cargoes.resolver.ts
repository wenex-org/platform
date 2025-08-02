import { CargoDataSerializer, CargoItemsSerializer, CargoSerializer } from '@app/common/serializers/logistic';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateCargoDto, CreateCargoItemsDto, UpdateCargoDto } from '@app/common/dto/logistic';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { LogisticProvider } from '@app/common/providers/logistic';
import { Cargo, CargoDto } from '@app/common/interfaces/logistic';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('cargoes', 'logistic');

@Resolver(() => CargoSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CargoesResolver extends ControllerClass<Cargo, CargoDto> implements IController<Cargo, CargoDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.cargoes, CargoSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  countLogisticCargo(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/cargoes', 'create')
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  createLogisticCargo(@Meta() meta: Metadata, @Args('data') data: CreateCargoDto): Observable<CargoDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CargoItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @Validation('logistic/cargoes', 'create')
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  createLogisticCargoBulk(@Meta() meta: Metadata, @Args('data') data: CreateCargoItemsDto): Observable<CargoItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CargoItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticCargo(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Cargo>): Observable<CargoItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findLogisticCargoById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Delete, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteLogisticCargoById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Restore, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreLogisticCargoById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @SetPolicy(Action.Destroy, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyLogisticCargoById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @Validation('logistic/cargoes', 'update')
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticCargoBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateCargoDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Cargo>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @Validation('logistic/cargoes', 'update')
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateLogisticCargoById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Args('data') update: UpdateCargoDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
