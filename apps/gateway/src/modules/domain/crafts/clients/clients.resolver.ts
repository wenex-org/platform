import { CreateClientDto, CreateClientItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateClientDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, ClientDataSerializer, ClientItemsSerializer, ClientSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Client, ClientDto } from '@app/common/interfaces';
import { Cache, Nested, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => ClientSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@Nested<Client>('domains', 'services')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ClientsResolver extends ControllerClass<Client, ClientDto> implements ControllerInterface<Client, ClientDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.clients, () => ClientSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainClients)
  countClient(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainClients)
  createClient(@Meta() meta: Metadata, @Args('data') data: CreateClientDto): Observable<ClientDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ClientItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.DomainClients)
  createBulkClient(@Meta() meta: Metadata, @Args('data') data: CreateClientItemsDto): Observable<ClientItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ClientItemsSerializer)
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findClient(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Client>): Observable<ClientItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Delete, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Restore, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Destroy, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Args('data') update: UpdateClientDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkClient(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Client>,
    @Args('data') update: UpdateClientDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
