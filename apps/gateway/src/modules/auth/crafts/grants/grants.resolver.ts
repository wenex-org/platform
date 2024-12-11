import { GrantDataSerializer, GrantItemsSerializer, GrantSerializer } from '@app/common/serializers/auth';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateGrantDto, CreateGrantItemsDto, UpdateGrantDto } from '@app/common/dto/auth';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { Grant, GrantDto } from '@app/common/interfaces/auth';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { AuthProvider } from '@app/common/providers/auth';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => GrantSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsResolver extends ControllerClass<Grant, GrantDto> implements IController<Grant, GrantDto> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, GrantSerializer);
  }

  @Query(() => TotalSerializer)
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  countGrant(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createGrant(@Meta() meta: Metadata, @Args('data') data: CreateGrantDto): Observable<GrantDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => GrantItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createGrantBulk(@Meta() meta: Metadata, @Args('data') data: CreateGrantItemsDto): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => GrantItemsSerializer)
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findGrant(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Grant>): Observable<GrantItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => GrantDataSerializer)
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findGrantById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteGrantById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreGrantById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyGrantById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGrantBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateGrantDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Grant>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => GrantDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGrantById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Args('data') update: UpdateGrantDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
