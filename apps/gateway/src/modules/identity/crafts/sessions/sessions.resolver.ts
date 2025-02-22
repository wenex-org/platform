import { SessionDataSerializer, SessionItemsSerializer, SessionSerializer } from '@app/common/serializers/identity';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSessionDto, CreateSessionItemsDto, UpdateSessionDto } from '@app/common/dto/identity';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Session, SessionDto } from '@app/common/interfaces/identity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => SessionSerializer)
@RateLimit('sessions')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SessionsResolver extends ControllerClass<Session, SessionDto> implements IController<Session, SessionDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, SessionSerializer);
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
  createSessionBulk(@Meta() meta: Metadata, @Args('data') data: CreateSessionItemsDto): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SessionItemsSerializer)
  @Cache(Collection.Sessions, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Session>): Observable<SessionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Delete, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteSessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Restore, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreSessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Destroy, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroySessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSessionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSessionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Session>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SessionDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Sessions, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Session>,
    @Args('data') update: UpdateSessionDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
