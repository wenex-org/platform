import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ProductDataSerializer, ProductItemsSerializer, ProductSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateProductDto, CreateProductItemsDto, UpdateProductDto } from '@app/common/dto/career';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { SearchDataSerializer, SearchSerializer } from '@app/common/core/serializers/elastic';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Product, ProductDto } from '@app/common/interfaces/career';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { SearchRequestDto } from '@app/common/core/dto/elastic';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('products', 'career');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('career', 'products')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProductsController extends ControllerClass<Product, ProductDto> implements IController<Product, ProductDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.products, ProductSerializer);
  }

  @Post('search')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.SearchCareerProducts)
  @ApiResponse({ type: SearchDataSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Search, Resource.CareerProducts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  search(
    @Meta() meta: Metadata,
    @Body() request: SearchRequestDto,
    @Filter() filter: FilterDto<Product>,
  ): Observable<SearchDataSerializer<Product>> {
    return from(this.provider.products.search(filter, request, { meta })).pipe(mapToInstance(SearchSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/products', 'create')
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Create, Resource.CareerProducts)
  override create(@Meta() meta: Metadata, @Body() data: CreateProductDto): Observable<ProductDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/products', 'create')
  @ApiResponse({ type: ProductItemsSerializer })
  @SetPolicy(Action.Create, Resource.CareerProducts)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateProductItemsDto): Observable<ProductItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @ApiResponse({ type: ProductItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Product>): Observable<ProductItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadCareerProducts)
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: ProductSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Product>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-product');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerProducts)
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Read, Resource.CareerProducts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Product>): Observable<ProductDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Delete, Resource.CareerProducts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Product>): Observable<ProductDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Restore, Resource.CareerProducts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Product>): Observable<ProductDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerProducts)
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Destroy, Resource.CareerProducts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Product>): Observable<ProductDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerProducts)
  @Validation('career/products', 'update')
  @SetPolicy(Action.Update, Resource.CareerProducts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Product>,
    @Body() update: UpdateProductDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerProducts)
  @Validation('career/products', 'update')
  @ApiResponse({ type: ProductDataSerializer })
  @SetPolicy(Action.Update, Resource.CareerProducts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Product>,
    @Body() update: UpdateProductDto,
  ): Observable<ProductDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
