import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientDataSerializer, ClientItemsSerializer, ClientSerializer } from '@app/common/serializers/domain';
import { Cache, Nested, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateClientDto, CreateClientItemsDto, UpdateClientDto } from '@app/common/dto/domain';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Client, ClientDto } from '@app/common/interfaces/domain';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { DomainProvider } from '@app/common/providers/domain';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('clients')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Clients)
@Controller(Collection.Clients)
@UseFilters(AllExceptionsFilter)
@Nested<Client>('domains', 'services')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ClientsController extends ControllerClass<Client, ClientDto> implements IController<Client, ClientDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.clients, ClientSerializer);
  }

  @Get('count')
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Create, Resource.DomainClients)
  override create(@Meta() meta: Metadata, @Body() data: CreateClientDto): Observable<ClientDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ClientItemsSerializer })
  @SetPolicy(Action.Create, Resource.DomainClients)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateClientItemsDto): Observable<ClientItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @ApiResponse({ type: ClientItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Client>): Observable<ClientItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadDomainClients)
  @SetPolicy(Action.Read, Resource.DomainClients)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ClientSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Client>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Clients, 'fill')
  @SetScope(Scope.ReadDomainClients)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Read, Resource.DomainClients)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Client>): Observable<ClientDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Delete, Resource.DomainClients)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Client>): Observable<ClientDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Restore, Resource.DomainClients)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Client>): Observable<ClientDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Destroy, Resource.DomainClients)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Client>): Observable<ClientDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.ManageDomainClients)
  @SetPolicy(Action.Update, Resource.DomainClients)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Client>,
    @Body() update: UpdateClientDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Clients, 'flush')
  @SetScope(Scope.WriteDomainClients)
  @ApiResponse({ type: ClientDataSerializer })
  @SetPolicy(Action.Update, Resource.DomainClients)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Client>,
    @Body() update: UpdateClientDto,
  ): Observable<ClientDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
