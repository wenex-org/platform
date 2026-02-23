import { ProductDataSerializer, ProductItemsSerializer, ProductSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, Nested, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateProductDto, CreateProductItemsDto, UpdateProductDto } from '@app/common/dto/career';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Product, ProductDto } from '@app/common/interfaces/career';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('products', 'career');

@Resolver(() => ProductSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@Nested<Product>('features')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProductsResolver extends ControllerClass<Product, ProductDto> implements IController<Product, ProductDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.products, ProductSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  countCareerProduct(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ProductDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/products', 'create')
  @SetPolicy(Action.Create, Resource.CareerProducts)
  createCareerProduct(@Meta() meta: Metadata, @Args('data') data: CreateProductDto): Observable<ProductDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ProductItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/products', 'create')
  @SetPolicy(Action.Create, Resource.CareerProducts)
  createCareerProductBulk(@Meta() meta: Metadata, @Args('data') data: CreateProductItemsDto): Observable<ProductItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ProductItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerProduct(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Product>,
  ): Observable<ProductItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ProductDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerProductById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Product>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProductDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ProductDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @SetPolicy(Action.Delete, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerProductById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Product>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProductDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ProductDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @SetPolicy(Action.Restore, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerProductById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Product>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProductDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ProductDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerProducts)
  @SetPolicy(Action.Destroy, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerProductById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Product>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProductDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerProducts)
  @Validation('career/products', 'update')
  @SetPolicy(Action.Update, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerProductBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateProductDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Product>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ProductDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @Validation('career/products', 'update')
  @SetPolicy(Action.Update, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerProductById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Product>,
    @Args('data') update: UpdateProductDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProductDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
