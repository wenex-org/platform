import { BranchDataSerializer, BranchItemsSerializer, BranchSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateBranchDto, CreateBranchItemsDto, UpdateBranchDto } from '@app/common/dto/career';
import { Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Branch, BranchDto } from '@app/common/interfaces/career';
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

const COLL_PATH = COLLECTION('branches', 'career');

@Resolver(() => BranchSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class BranchesResolver extends ControllerClass<Branch, BranchDto> implements IController<Branch, BranchDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.branches, BranchSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBranches)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  countCareerBranch(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/branches', 'create')
  @SetPolicy(Action.Create, Resource.CareerBranches)
  createCareerBranch(@Meta() meta: Metadata, @Args('data') data: CreateBranchDto): Observable<BranchDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => BranchItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @UseInterceptors(...WriteInterceptors)
  @Validation('career/branches', 'create')
  @SetPolicy(Action.Create, Resource.CareerBranches)
  createCareerBranchBulk(@Meta() meta: Metadata, @Args('data') data: CreateBranchItemsDto): Observable<BranchItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => BranchItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBranches)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerBranch(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Branch>): Observable<BranchItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBranches)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findCareerBranchById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Branch>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BranchDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @SetPolicy(Action.Delete, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteCareerBranchById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Branch>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BranchDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @SetPolicy(Action.Restore, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreCareerBranchById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Branch>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BranchDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBranches)
  @SetPolicy(Action.Destroy, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyCareerBranchById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Branch>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BranchDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBranches)
  @Validation('career/branches', 'update')
  @SetPolicy(Action.Update, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerBranchBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateBranchDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Branch>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => BranchDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @Validation('career/branches', 'update')
  @SetPolicy(Action.Update, Resource.CareerBranches)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateCareerBranchById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Branch>,
    @Args('data') update: UpdateBranchDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<BranchDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
