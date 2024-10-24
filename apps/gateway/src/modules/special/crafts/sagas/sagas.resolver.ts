import { CreateSagaDto, CreateSagaItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateSagaDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, SagaDataSerializer, SagaItemsSerializer, SagaSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Saga, SagaDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => SagaSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasResolver extends ControllerClass<Saga, SagaDto> implements ControllerInterface<Saga, SagaDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.sagas, () => SagaSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  countSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialSagas)
  createSaga(@Meta() meta: Metadata, @Args('data') data: CreateSagaDto): Observable<SagaDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SagaItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialSagas)
  createBulkSaga(@Meta() meta: Metadata, @Args('data') data: CreateSagaItemsDto): Observable<SagaItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SagaItemsSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Saga>): Observable<SagaItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadSpecialSagas)
  @SetPolicy(Action.Read, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneSaga(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Delete, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneSaga(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Restore, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneSaga(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageSpecialSagas)
  @SetPolicy(Action.Destroy, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneSaga(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteSpecialSagas)
  @SetPolicy(Action.Update, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneSaga(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Args('data') update: UpdateSagaDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageSpecialSagas)
  @SetPolicy(Action.Update, Resource.SpecialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkSaga(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Saga>,
    @Args('data') update: UpdateSagaDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
