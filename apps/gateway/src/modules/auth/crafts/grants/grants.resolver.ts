import {
  TotalSerializer,
  GrantDataSerializer,
  GrantItemsSerializer,
  GrantSerializer,
} from '@app/common/serializers';
import {
  CreateGrantDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateGrantDto,
} from '@app/common/dto';
import {
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  Grant,
  GrantDto,
} from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { AuthProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => GrantSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsResolver
  extends ControllerClass<Grant, GrantDto>
  implements ControllerInterface<Grant, GrantDto>
{
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, () => GrantSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  countGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => GrantDataSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createGrant(
    @Meta() meta: Metadata,
    @Args('data') data: CreateGrantDto,
    @Session() session?: ClientSession,
  ): Observable<GrantDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => GrantItemsSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createBulkGrant(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateGrantDto] }) items: CreateGrantDto[],
    @Session() session?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => GrantItemsSerializer)
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => GrantDataSerializer)
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => GrantDataSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => GrantDataSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => GrantDataSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => GrantDataSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Args('data') update: UpdateGrantDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @Cache('grants', 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Grant>,
    @Args('data') update: UpdateGrantDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
