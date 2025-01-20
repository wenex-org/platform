import { ClientDataSerializer, ClientItemsSerializer, ClientSerializer } from '@app/common/serializers/domain';
import { Cache, Nested, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateClientDto, CreateClientItemsDto, UpdateClientDto } from '@app/common/dto/domain';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Client, ClientDto } from '@app/common/interfaces/domain';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { DomainProvider } from '@app/common/providers/domain';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => ClientSerializer)
@RateLimit('clients')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@Nested<Client>('domains', 'services')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ClientsResolver extends ControllerClass<Client, ClientDto> implements IController<Client, ClientDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.clients, ClientSerializer);
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
  createClientBulk(@Meta() meta: Metadata, @Args('data') data: CreateClientItemsDto): Observable<ClientItemsSerializer> {
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
  findClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Delete, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Restore, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Destroy, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateClientBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateClientDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Client>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ClientDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Args('data') update: UpdateClientDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
