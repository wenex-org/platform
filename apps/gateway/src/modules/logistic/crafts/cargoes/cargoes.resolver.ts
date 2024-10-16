import { CreateCargoDto, CreateCargoItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateCargoDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, CargoDataSerializer, CargoItemsSerializer, CargoSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Cargo, CargoDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { LogisticProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => CargoSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CargoesResolver extends ControllerClass<Cargo, CargoDto> implements ControllerInterface<Cargo, CargoDto> {
  constructor(readonly provider: LogisticProvider) {
    super(provider.cargoes, () => CargoSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  countCargo(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  createCargo(@Meta() meta: Metadata, @Args('data') data: CreateCargoDto): Observable<CargoDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CargoItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.LogisticCargoes)
  createBulkCargo(@Meta() meta: Metadata, @Args('data') data: CreateCargoItemsDto): Observable<CargoItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CargoItemsSerializer)
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findCargo(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Cargo>): Observable<CargoItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CargoDataSerializer)
  @Cache(Collection.Cargoes, 'fill')
  @SetScope(Scope.ReadLogisticCargoes)
  @SetPolicy(Action.Read, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneCargo(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Delete, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneCargo(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Restore, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneCargo(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @SetPolicy(Action.Destroy, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneCargo(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Cargo>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => CargoDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.WriteLogisticCargoes)
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneCargo(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Cargo>,
    @Args('data') update: UpdateCargoDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<CargoDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Cargoes, 'flush')
  @SetScope(Scope.ManageLogisticCargoes)
  @SetPolicy(Action.Update, Resource.LogisticCargoes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkCargo(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Cargo>,
    @Args('data') update: UpdateCargoDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
