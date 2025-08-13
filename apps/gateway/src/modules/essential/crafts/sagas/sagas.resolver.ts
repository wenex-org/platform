import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { SagaDataSerializer, SagaItemsSerializer, SagaSerializer } from '@app/common/serializers/essential';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateSagaDto, CreateSagaItemsDto, UpdateSagaDto } from '@app/common/dto/essential';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { EssentialProvider } from '@app/common/providers/essential';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Saga, SagaDto } from '@app/common/interfaces/essential';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('sagas', 'essential');

@Resolver(() => SagaSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasResolver extends ControllerClass<Saga, SagaDto> implements IController<Saga, SagaDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas, SagaSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  countEssentialSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @Validation('essential/sagas', 'create')
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  createEssentialSaga(@Meta() meta: Metadata, @Args('data') data: CreateSagaDto): Observable<SagaDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SagaItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @UseInterceptors(...WriteInterceptors)
  @Validation('essential/sagas', 'create')
  @SetPolicy(Action.Create, Resource.EssentialSagas)
  createEssentialSagaBulk(@Meta() meta: Metadata, @Args('data') data: CreateSagaItemsDto): Observable<SagaItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SagaItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEssentialSaga(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Saga>): Observable<SagaItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SagaDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEssentialSagas)
  @SetPolicy(Action.Read, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEssentialSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @SetPolicy(Action.Delete, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEssentialSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @SetPolicy(Action.Restore, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEssentialSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SagaDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @SetPolicy(Action.Destroy, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEssentialSagaById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Saga>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEssentialSagas)
  @Validation('essential/sagas', 'update')
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEssentialSagaBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSagaDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Saga>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SagaDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEssentialSagas)
  @Validation('essential/sagas', 'update')
  @SetPolicy(Action.Update, Resource.EssentialSagas)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEssentialSagaById(
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
