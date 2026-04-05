import { ChannelAccessDto, CreateChannelDto, CreateChannelItemsDto, UpdateChannelDto } from '@app/common/dto/conjoint';
import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { ChannelDataSerializer, ChannelItemsSerializer, ChannelSerializer } from '@app/common/serializers/conjoint';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { GrantItemsSerializer, GrantSerializer } from '@app/common/serializers/auth';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Channel, ChannelDto } from '@app/common/interfaces/conjoint';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ConjointProvider } from '@app/common/providers/conjoint';
import { channelAccessGrants } from '@app/common/utils/conjoint';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { AuthProvider } from '@app/common/providers/auth';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { mapToInstance } from '@app/common/core/utils';
import { from, Observable, switchMap } from 'rxjs';

const COLL_PATH = COLLECTION('channels', 'conjoint');
const AUTH_GRANTS_COLL_PATH = COLLECTION('grants', 'auth');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ChannelsResolver extends ControllerClass<Channel, ChannelDto> implements IController<Channel, ChannelDto> {
  constructor(
    readonly provider: ConjointProvider,
    readonly auth: AuthProvider,
  ) {
    super(provider.channels, ChannelSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointChannels)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConjointChannels)
  countConjointChannel(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ChannelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/channels', 'create')
  @SetPolicy(Action.Create, Resource.ConjointChannels)
  createConjointChannel(@Meta() meta: Metadata, @Args('data') data: CreateChannelDto): Observable<ChannelDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ChannelItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/channels', 'create')
  @SetPolicy(Action.Create, Resource.ConjointChannels)
  createConjointChannelBulk(@Meta() meta: Metadata, @Args('data') data: CreateChannelItemsDto): Observable<ChannelItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Mutation(() => GrantItemsSerializer)
  @Audit('GATEWAY')
  @Cache(AUTH_GRANTS_COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Update, Resource.ConjointChannels)
  accessConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Args('data') data: ChannelAccessDto,
  ): Observable<GrantItemsSerializer> {
    return from(this.provider.channels.findById({ query: { id } }, { meta })).pipe(
      switchMap((channel) => this.auth.grants.createBulk(channelAccessGrants(channel, data), { meta })),
      mapToInstance(GrantSerializer, 'items'),
    );
  }

  @Query(() => ChannelItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointChannels)
  @SetPolicy(Action.Read, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointChannel(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Channel>,
  ): Observable<ChannelItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ChannelDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointChannels)
  @SetPolicy(Action.Read, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Channel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ChannelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ChannelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @SetPolicy(Action.Delete, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Channel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ChannelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ChannelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @SetPolicy(Action.Restore, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Channel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ChannelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ChannelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointChannels)
  @SetPolicy(Action.Destroy, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Channel>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ChannelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointChannels)
  @Validation('conjoint/channels', 'update')
  @SetPolicy(Action.Update, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointChannelBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateChannelDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Channel>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ChannelDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointChannels)
  @Validation('conjoint/channels', 'update')
  @SetPolicy(Action.Update, Resource.ConjointChannels)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointChannelById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Channel>,
    @Args('data') update: UpdateChannelDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ChannelDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
