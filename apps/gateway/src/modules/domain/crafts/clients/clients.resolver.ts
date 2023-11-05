import {
  TotalSerializer,
  ClientDataSerializer,
  ClientItemsSerializer,
  ClientSerializer,
} from '@app/common/serializers';
import {
  CreateClientDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateClientDto,
} from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Metadata, ClientDom, ClientSer } from '@app/common/interfaces';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => ClientSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class ClientsResolver extends GrpcController<ClientDom, ClientSer> {
  constructor(readonly provider: DomainProvider) {
    super(provider.clients, () => ClientSerializer);
  }

  @Query(() => TotalSerializer)
  countClient(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => ClientDataSerializer)
  createClient(
    @Meta() meta: Metadata,
    @Args('data') data: CreateClientDto,
    @Session() session?: ClientSession,
  ): Observable<ClientDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => ClientItemsSerializer)
  createBulkClient(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateClientDto] }) items: CreateClientDto[],
    @Session() session?: ClientSession,
  ): Observable<ClientItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => ClientItemsSerializer)
  findClient(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<ClientDom>,
    @Session() session?: ClientSession,
  ): Observable<ClientItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => ClientDataSerializer)
  findOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ClientDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => ClientDataSerializer)
  deleteOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ClientDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => ClientDataSerializer)
  restoreOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ClientDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => ClientDataSerializer)
  destroyOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ClientDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => ClientDataSerializer)
  updateOneClient(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ClientDom>,
    @Args('data') update: UpdateClientDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ClientDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  updateBulkClient(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<ClientDom>,
    @Args('data') update: UpdateClientDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
