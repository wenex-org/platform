import { TicketDataSerializer, TicketItemsSerializer, TicketSerializer } from '@app/common/serializers/content';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateTicketDto, CreateTicketItemsDto, UpdateTicketDto } from '@app/common/dto/content';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Ticket, TicketDto } from '@app/common/interfaces/content';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ContentProvider } from '@app/common/providers/content';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('tickets', 'content');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TicketsResolver extends ControllerClass<Ticket, TicketDto> implements IController<Ticket, TicketDto> {
  constructor(readonly provider: ContentProvider) {
    super(provider.tickets, TicketSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  countContentTicket(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @UseInterceptors(...WriteInterceptors)
  @Validation('content/tickets', 'create')
  @SetPolicy(Action.Create, Resource.ContentTickets)
  createContentTicket(@Meta() meta: Metadata, @Args('data') data: CreateTicketDto): Observable<TicketDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TicketItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @UseInterceptors(...WriteInterceptors)
  @Validation('content/tickets', 'create')
  @SetPolicy(Action.Create, Resource.ContentTickets)
  createContentTicketBulk(@Meta() meta: Metadata, @Args('data') data: CreateTicketItemsDto): Observable<TicketItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => TicketItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContentTicket(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Ticket>,
  ): Observable<TicketItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => TicketDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContentTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @SetPolicy(Action.Delete, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteContentTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @SetPolicy(Action.Restore, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreContentTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentTickets)
  @SetPolicy(Action.Destroy, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyContentTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentTickets)
  @Validation('content/tickets', 'update')
  @SetPolicy(Action.Update, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContentTicketBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateTicketDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Ticket>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => TicketDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @Validation('content/tickets', 'update')
  @SetPolicy(Action.Update, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContentTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Ticket>,
    @Args('data') update: UpdateTicketDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
