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
import { GrantDataSerializer, GrantItemsSerializer, GrantSerializer } from '@app/common/serializers/auth';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateGrantDto, CreateGrantItemsDto, UpdateGrantDto } from '@app/common/dto/auth';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { Grant, GrantDto } from '@app/common/interfaces/auth';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { AuthProvider } from '@app/common/providers/auth';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('grants')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Grants)
@Controller(Collection.Grants)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsController extends ControllerClass<Grant, GrantDto> implements IController<Grant, GrantDto> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, GrantSerializer);
  }

  @Get('count')
  @Cache(Collection.Grants, 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Create, Resource.AuthGrants)
  override create(@Meta() meta: Metadata, @Body() data: CreateGrantDto): Observable<GrantDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: GrantItemsSerializer })
  @SetPolicy(Action.Create, Resource.AuthGrants)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateGrantItemsDto): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Grants, 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiResponse({ type: GrantItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Grant>): Observable<GrantItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: GrantSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Grant>) {
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
  @Cache(Collection.Grants, 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Grant>): Observable<GrantDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Grant>): Observable<GrantDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Grant>): Observable<GrantDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Grant>): Observable<GrantDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Grant>,
    @Body() update: UpdateGrantDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Grants, 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @ApiResponse({ type: GrantDataSerializer })
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Body() update: UpdateGrantDto,
  ): Observable<GrantDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
