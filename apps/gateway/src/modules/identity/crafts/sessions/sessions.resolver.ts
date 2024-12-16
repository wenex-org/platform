import { SessionDataSerializer, SessionItemsSerializer, SessionSerializer } from '@app/common/serializers/identity';
import { CreateSessionDto, CreateSessionItemsDto, UpdateSessionDto } from '@app/common/dto/identity';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Session, SessionDto } from '@app/common/interfaces/identity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => SessionSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SessionsResolver extends ControllerClass<Session, SessionDto> implements IController<Session, SessionDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, SessionSerializer);
  }

  @Query(() => TotalSerializer)
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  countSession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createSession(@Meta() meta: Metadata, @Args('data') data: CreateSessionDto): Observable<SessionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SessionItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createSessionBulk(@Meta() meta: Metadata, @Args('data') data: CreateSessionItemsDto): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SessionItemsSerializer)
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Session>): Observable<SessionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SessionDataSerializer)
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @SetPolicy(Action.Delete, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @SetPolicy(Action.Restore, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.ManageIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @SetPolicy(Action.Destroy, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.ManageIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
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
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
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
