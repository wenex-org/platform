import { TicketDataSerializer, TicketItemsSerializer, TicketSerializer } from '@app/common/serializers/content';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateTicketDto, CreateTicketItemsDto, UpdateTicketDto } from '@app/common/dto/content';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
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

@Resolver(() => TicketSerializer)
@RateLimit('tickets')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class TicketsResolver extends ControllerClass<Ticket, TicketDto> implements IController<Ticket, TicketDto> {
  constructor(readonly provider: ContentProvider) {
    super(provider.tickets, TicketSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Tickets, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  countTicket(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentTickets)
  createTicket(@Meta() meta: Metadata, @Args('data') data: CreateTicketDto): Observable<TicketDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => TicketItemsSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentTickets)
  createTicketBulk(@Meta() meta: Metadata, @Args('data') data: CreateTicketItemsDto): Observable<TicketItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => TicketItemsSerializer)
  @Cache(Collection.Tickets, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTicket(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Ticket>): Observable<TicketItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'fill')
  @SetScope(Scope.ReadContentTickets)
  @SetPolicy(Action.Read, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @SetPolicy(Action.Delete, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @SetPolicy(Action.Restore, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.ManageContentTickets)
  @SetPolicy(Action.Destroy, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyTicketById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Ticket>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<TicketDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.ManageContentTickets)
  @SetPolicy(Action.Update, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTicketBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateTicketDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Ticket>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => TicketDataSerializer)
  @Cache(Collection.Tickets, 'flush')
  @SetScope(Scope.WriteContentTickets)
  @SetPolicy(Action.Update, Resource.ContentTickets)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTicketById(
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
