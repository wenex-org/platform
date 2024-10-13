import {
  TotalSerializer,
  SagaHistoryDataSerializer,
  SagaHistoryItemsSerializer,
  SagaHistorySerializer,
} from '@app/common/serializers';
import {
  CreateSagaHistoryDto,
  CreateSagaHistoryItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSagaHistoryDto,
} from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, SagaHistory, SagaHistoryDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => SagaHistorySerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagaHistoriesResolver
  extends ControllerClass<SagaHistory, SagaHistoryDto>
  implements ControllerInterface<SagaHistory, SagaHistoryDto>
{
  constructor(readonly provider: SpecialProvider) {
    super(provider.sagas.histories, () => SagaHistorySerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('saga-histories', 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetScope(Scope.ReadSpecialSagaHistories)
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  countSagaHistory(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SagaHistoryDataSerializer)
  @ShipStrategy('create')
  @Cache('saga-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Create, Resource.SpecialSagaHistories)
  createSagaHistory(@Meta() meta: Metadata, @Args('data') data: CreateSagaHistoryDto): Observable<SagaHistoryDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SagaHistoryItemsSerializer)
  @ShipStrategy('create')
  @Cache('saga-histories', 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Create, Resource.SpecialSagaHistories)
  createBulkSagaHistory(
    @Meta() meta: Metadata,
    @Args('data') data: CreateSagaHistoryItemsDto,
  ): Observable<SagaHistoryItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SagaHistoryItemsSerializer)
  @Cache('saga-histories', 'fill')
  @SetScope(Scope.ReadSpecialSagaHistories)
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSagaHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<SagaHistory>,
  ): Observable<SagaHistoryItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SagaHistoryDataSerializer)
  @Cache('saga-histories', 'fill')
  @SetScope(Scope.ReadSpecialSagaHistories)
  @SetPolicy(Action.Read, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneSagaHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SagaHistoryDataSerializer)
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Delete, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneSagaHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SagaHistoryDataSerializer)
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Restore, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneSagaHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SagaHistoryDataSerializer)
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.ManageSpecialSagaHistories)
  @SetPolicy(Action.Destroy, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneSagaHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaHistory>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => SagaHistoryDataSerializer)
  @ShipStrategy('update')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.WriteSpecialSagaHistories)
  @SetPolicy(Action.Update, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneSagaHistory(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaHistory>,
    @Args('data') update: UpdateSagaHistoryDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SagaHistoryDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('saga-histories', 'flush')
  @SetScope(Scope.ManageSpecialSagaHistories)
  @SetPolicy(Action.Update, Resource.SpecialSagaHistories)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkSagaHistory(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<SagaHistory>,
    @Args('data') update: UpdateSagaHistoryDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
