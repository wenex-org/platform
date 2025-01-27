import { SagaStageDataSerializer, SagaStageItemsSerializer, SagaStageSerializer } from '@app/common/serializers/essential';
import { CreateSagaStageDto, CreateSagaStageItemsDto, UpdateSagaStageDto } from '@app/common/dto/essential';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { SagaStage, SagaStageDto } from '@app/common/interfaces/essential';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { EssentialProvider } from '@app/common/providers/essential';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => SagaStageSerializer)
@RateLimit('saga-stages')
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagaStagesResolver extends ControllerClass<SagaStage, SagaStageDto> implements IController<SagaStage, SagaStageDto> {
  constructor(readonly provider: EssentialProvider) {
    super(provider.sagas.stages, SagaStageSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  countSagaStage(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SagaStageDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  createSagaStage(@Meta() meta: Metadata, @Args('data') data: CreateSagaStageDto): Observable<SagaStageDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SagaStageItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EssentialSagaStages)
  createSagaStageBulk(@Meta() meta: Metadata, @Args('data') data: CreateSagaStageItemsDto): Observable<SagaStageItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SagaStageItemsSerializer)
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSagaStage(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<SagaStage>,
  ): Observable<SagaStageItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SagaStageDataSerializer)
  @Cache(Collection.SagaStages, 'fill')
  @SetScope(Scope.ReadEssentialSagaStages)
  @SetPolicy(Action.Read, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSagaStageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaStage>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaStageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SagaStageDataSerializer)
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @SetPolicy(Action.Delete, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteSagaStageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaStage>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaStageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SagaStageDataSerializer)
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @SetPolicy(Action.Restore, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreSagaStageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaStage>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaStageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SagaStageDataSerializer)
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
  @SetPolicy(Action.Destroy, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroySagaStageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SagaStage>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaStageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.ManageEssentialSagaStages)
  @SetPolicy(Action.Update, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSagaStageBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSagaStageDto,
    @Filter() @Args('filter') filter: QueryFilterDto<SagaStage>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SagaStageDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.SagaStages, 'flush')
  @SetScope(Scope.WriteEssentialSagaStages)
  @SetPolicy(Action.Update, Resource.EssentialSagaStages)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSagaStageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SagaStage>,
    @Args('data') update: UpdateSagaStageDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SagaStageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
