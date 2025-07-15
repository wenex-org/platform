import { SessionDataSerializer, SessionItemsSerializer, SessionSerializer } from '@app/common/serializers/identity';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSessionDto, CreateSessionItemsDto, UpdateSessionDto } from '@app/common/dto/identity';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
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

const COLL_PATH = COLLECTION('sessions', 'identity');

@Resolver(() => SessionSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SessionsResolver extends ControllerClass<Session, SessionDto> implements IController<Session, SessionDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, SessionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  countIdentitySession(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createIdentitySession(@Meta() meta: Metadata, @Args('data') data: CreateSessionDto): Observable<SessionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SessionItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  createIdentitySessionBulk(@Meta() meta: Metadata, @Args('data') data: CreateSessionItemsDto): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SessionItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findIdentitySession(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Session>,
  ): Observable<SessionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findIdentitySessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Delete, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteIdentitySessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Restore, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreIdentitySessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Destroy, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyIdentitySessionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Session>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateIdentitySessionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSessionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Session>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SessionDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentitySessions)
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateIdentitySessionById(
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
