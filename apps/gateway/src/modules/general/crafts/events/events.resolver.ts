import { EventDataSerializer, EventItemsSerializer, EventSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateEventDto, CreateEventItemsDto, UpdateEventDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Event, EventDto } from '@app/common/interfaces/general';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('events', 'general');

@Resolver(() => EventSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EventsResolver extends ControllerClass<Event, EventDto> implements IController<Event, EventDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.events, EventSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralEvents)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralEvents)
  countGeneralEvent(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => EventDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralEvents)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralEvents)
  createGeneralEvent(@Meta() meta: Metadata, @Args('data') data: CreateEventDto): Observable<EventDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => EventItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralEvents)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralEvents)
  createGeneralEventBulk(@Meta() meta: Metadata, @Args('data') data: CreateEventItemsDto): Observable<EventItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => EventItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralEvents)
  @SetPolicy(Action.Read, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralEvent(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Event>): Observable<EventItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => EventDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralEvents)
  @SetPolicy(Action.Read, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralEventById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Event>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EventDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => EventDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralEvents)
  @SetPolicy(Action.Delete, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteGeneralEventById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Event>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EventDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => EventDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralEvents)
  @SetPolicy(Action.Restore, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreGeneralEventById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Event>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EventDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => EventDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralEvents)
  @SetPolicy(Action.Destroy, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyGeneralEventById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Event>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EventDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralEvents)
  @SetPolicy(Action.Update, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralEventBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateEventDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Event>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => EventDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralEvents)
  @SetPolicy(Action.Update, Resource.GeneralEvents)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralEventById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Event>,
    @Args('data') update: UpdateEventDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EventDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
