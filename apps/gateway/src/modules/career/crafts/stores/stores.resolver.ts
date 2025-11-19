import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { StoreDataSerializer, StoreItemsSerializer, StoreSerializer } from '@app/common/serializers/career';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateStoreDto, CreateStoreItemsDto, UpdateStoreDto } from '@app/common/dto/career';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Store, StoreDto } from '@app/common/interfaces/career';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('stores', 'career');

@Resolver(() => StoreSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class StoresResolver extends ControllerClass<Store, StoreDto> implements IController<Store, StoreDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.stores, StoreSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStores)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerStores)
  countCareerStore(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => StoreDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStores)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stores', 'create')
  @SetPolicy(Action.Create, Resource.CareerStores)
  createCareerStore(@Meta() meta: Metadata, @Args('data') data: CreateStoreDto): Observable<StoreDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => StoreItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStores)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/stores', 'create')
  @SetPolicy(Action.Create, Resource.CareerStores)
  createCareerStoreBulk(@Meta() meta: Metadata, @Args('data') data: CreateStoreItemsDto): Observable<StoreItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => StoreItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStores)
  @SetPolicy(Action.Read, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerStore(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Store>): Observable<StoreItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => StoreDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerStores)
  @SetPolicy(Action.Read, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerStoreById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Store>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StoreDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => StoreDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStores)
  @SetPolicy(Action.Delete, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerStoreById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Store>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StoreDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => StoreDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStores)
  @SetPolicy(Action.Restore, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerStoreById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Store>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StoreDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => StoreDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStores)
  @SetPolicy(Action.Destroy, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerStoreById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Store>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StoreDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerStores)
  @Validation('career/stores', 'update')
  @SetPolicy(Action.Update, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerStoreBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateStoreDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Store>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => StoreDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerStores)
  @Validation('career/stores', 'update')
  @SetPolicy(Action.Update, Resource.CareerStores)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerStoreById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Store>,
    @Args('data') update: UpdateStoreDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<StoreDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
