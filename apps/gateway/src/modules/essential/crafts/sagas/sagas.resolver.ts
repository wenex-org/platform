import { SagaDataSerializer, SagaItemsSerializer, SagaSerializer } from '@app/common/serializers/essential';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateSagaDto, CreateSagaItemsDto, UpdateSagaDto } from '@app/common/dto/essential';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { EssentialProvider } from '@app/common/providers/essential';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Saga, SagaDto } from '@app/common/interfaces/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => SagaSerializer)
@RateLimit('sagas')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasResolver extends ControllerClass<Saga, SagaDto> implements IController<Saga, SagaDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas, SagaSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  countSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  createSaga(@Meta() meta: Metadata, @Args('data') data: CreateSagaDto): Observable<SagaDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SagaItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  createSagaBulk(@Meta() meta: Metadata, @Args('data') data: CreateSagaItemsDto): Observable<SagaItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SagaItemsSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Saga>): Observable<SagaItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @SetPolicy(Action.Delete, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @SetPolicy(Action.Restore, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @SetPolicy(Action.Destroy, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroySagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSagaBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSagaDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Saga>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SagaDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sagas, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Args('data') update: UpdateSagaDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
