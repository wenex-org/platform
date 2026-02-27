import { ClientDataSerializer, ClientItemsSerializer, ClientSerializer } from '@app/common/serializers/domain';
import { Audit, Cache, Nested, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateClientDto, CreateClientItemsDto, UpdateClientDto } from '@app/common/dto/domain';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Client, ClientDto } from '@app/common/interfaces/domain';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { DomainProvider } from '@app/common/providers/domain';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('clients', 'domain');

@Resolver()
@RateLimit(COLL_PATH)
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
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainClients)
  countDomainClient(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @Validation('domain/clients', 'create')
  @SetPolicy(Action.Create, Resource.DomainClients)
  createDomainClient(@Meta() meta: Metadata, @Args('data') data: CreateClientDto): Observable<ClientDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ClientItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @Validation('domain/clients', 'create')
  @SetPolicy(Action.Create, Resource.DomainClients)
  createDomainClientBulk(@Meta() meta: Metadata, @Args('data') data: CreateClientItemsDto): Observable<ClientItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ClientItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDomainClient(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Client>): Observable<ClientItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ClientDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findDomainClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Delete, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteDomainClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @SetPolicy(Action.Restore, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreDomainClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ClientDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Destroy, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyDomainClientById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Client>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @Validation('domain/clients', 'update')
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDomainClientBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateClientDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Client>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ClientDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @Validation('domain/clients', 'update')
  @SetPolicy(Action.Update, Resource.DomainClients)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateDomainClientById(
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
