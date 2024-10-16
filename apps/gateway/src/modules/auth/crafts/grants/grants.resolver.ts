import { CreateGrantDto, CreateGrantItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateGrantDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, GrantDataSerializer, GrantItemsSerializer, GrantSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Grant, GrantDto } from '@app/common/interfaces';
import { Cache, Nested, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { AuthProvider } from '@app/common/providers';
import { Observable } from 'rxjs';

@Resolver(() => GrantSerializer)
@Nested<Grant>('time')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsResolver extends ControllerClass<Grant, GrantDto> implements ControllerInterface<Grant, GrantDto> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, () => GrantSerializer);
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
  createBulkGrant(@Meta() meta: Metadata, @Args('data') data: CreateGrantItemsDto): Observable<GrantItemsSerializer> {
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
  findOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => GrantDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Args('data') update: UpdateGrantDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Grant>,
    @Args('data') update: UpdateGrantDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
