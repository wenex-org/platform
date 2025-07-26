import { BusinessDataSerializer, BusinessItemsSerializer, BusinessSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateBusinessDto, CreateBusinessItemsDto, UpdateBusinessDto } from '@app/common/dto/career';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Business, BusinessDto } from '@app/common/interfaces/career';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { CareerProvider } from '@app/common/providers/career';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('businesses', 'career');

@Resolver(() => BusinessSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class BusinessesResolver extends ControllerClass<Business, BusinessDto> implements IController<Business, BusinessDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.businesses, BusinessSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBusinesses)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerBusinesses)
  countCareerBusiness(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBusinesses)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.CareerBusinesses)
  createCareerBusiness(@Meta() meta: Metadata, @Args('data') data: CreateBusinessDto): Observable<BusinessDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => BusinessItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBusinesses)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.CareerBusinesses)
  createCareerBusinessBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateBusinessItemsDto,
  ): Observable<BusinessItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => BusinessItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBusinesses)
  @SetPolicy(Action.Read, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerBusiness(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Business>,
  ): Observable<BusinessItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBusinesses)
  @SetPolicy(Action.Read, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerBusinessById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Business>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BusinessDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBusinesses)
  @SetPolicy(Action.Delete, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerBusinessById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Business>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BusinessDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBusinesses)
  @SetPolicy(Action.Restore, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerBusinessById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Business>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BusinessDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBusinesses)
  @SetPolicy(Action.Destroy, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerBusinessById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Business>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BusinessDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBusinesses)
  @SetPolicy(Action.Update, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerBusinessBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateBusinessDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Business>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => BusinessDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBusinesses)
  @SetPolicy(Action.Update, Resource.CareerBusinesses)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerBusinessById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Business>,
    @Args('data') update: UpdateBusinessDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BusinessDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
