import {
  CreateSessionDto,
  CreateSessionItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSessionDto,
} from '@app/common/dto';
import { TotalSerializer, SessionDataSerializer, SessionItemsSerializer, SessionSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Session as ISession, Metadata, SessionDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => SessionSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SessionsResolver extends ControllerClass<ISession, SessionDto> implements ControllerInterface<ISession, SessionDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, () => SessionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Sessions, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  countSession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createSession(@Meta() meta: Metadata, @Args('data') data: CreateSessionDto): Observable<SessionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SessionItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createBulkSession(@Meta() meta: Metadata, @Args('data') data: CreateSessionItemsDto): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SessionItemsSerializer)
  @Cache(Collection.Sessions, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<ISession>): Observable<SessionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ISession>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Delete, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Restore, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Destroy, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ISession>,
    @Args('data') update: UpdateSessionDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkSession(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<ISession>,
    @Args('data') update: UpdateSessionDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
