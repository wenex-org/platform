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
import { SessionDataSerializer, SessionItemsSerializer, SessionSerializer } from '@app/common/serializers/identity';
import { CreateSessionDto, CreateSessionItemsDto, UpdateSessionDto } from '@app/common/dto/identity';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Session, SessionDto } from '@app/common/interfaces/identity';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('sessions')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Sessions)
@Controller(Collection.Sessions)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SessionsController extends ControllerClass<Session, SessionDto> implements IController<Session, SessionDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, SessionSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  override create(@Meta() meta: Metadata, @Body() data: CreateSessionDto): Observable<SessionDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: SessionItemsSerializer })
  @SetPolicy(Action.Create, Resource.IdentitySessions)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateSessionItemsDto): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @ApiResponse({ type: SessionItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Session>): Observable<SessionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadIdentitySessions)
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: SessionSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Session>) {
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
  @SetScope(Scope.ReadIdentitySessions)
  @Cache(Collection.Sessions, 'fill')
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Read, Resource.IdentitySessions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Session>): Observable<SessionDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Delete, Resource.IdentitySessions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Session>): Observable<SessionDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Restore, Resource.IdentitySessions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Session>): Observable<SessionDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Destroy, Resource.IdentitySessions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Session>): Observable<SessionDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Session>,
    @Body() update: UpdateSessionDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteIdentitySessions)
  @Cache(Collection.Sessions, 'flush')
  @ApiResponse({ type: SessionDataSerializer })
  @SetPolicy(Action.Update, Resource.IdentitySessions)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Session>,
    @Body() update: UpdateSessionDto,
  ): Observable<SessionDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
