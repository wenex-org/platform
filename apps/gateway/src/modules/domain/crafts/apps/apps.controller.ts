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
import { AppDataSerializer, AppItemsSerializer, AppSerializer } from '@app/common/serializers/domain';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateAppDto, CreateAppItemsDto, UpdateAppDto } from '@app/common/dto/domain';
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
import { DomainProvider } from '@app/common/providers/domain';
import { App, AppDto } from '@app/common/interfaces/domain';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('apps')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Apps)
@Controller(Collection.Apps)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsController extends ControllerClass<App, AppDto> implements IController<App, AppDto> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, AppSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadDomainApps)
  @Cache(Collection.Apps, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteDomainApps)
  @Cache(Collection.Apps, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Create, Resource.DomainApps)
  override create(@Meta() meta: Metadata, @Body() data: CreateAppDto): Observable<AppDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteDomainApps)
  @Cache(Collection.Apps, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: AppItemsSerializer })
  @SetPolicy(Action.Create, Resource.DomainApps)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateAppItemsDto): Observable<AppItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadDomainApps)
  @Cache(Collection.Apps, 'fill')
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiResponse({ type: AppItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<App>): Observable<AppItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: AppSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<App>) {
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
  @SetScope(Scope.ReadDomainApps)
  @Cache(Collection.Apps, 'fill')
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<App>): Observable<AppDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteDomainApps)
  @Cache(Collection.Apps, 'flush')
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<App>): Observable<AppDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteDomainApps)
  @Cache(Collection.Apps, 'flush')
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<App>): Observable<AppDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageDomainApps)
  @Cache(Collection.Apps, 'flush')
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<App>): Observable<AppDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageDomainApps)
  @Cache(Collection.Apps, 'flush')
  @SetPolicy(Action.Update, Resource.DomainApps)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<App>,
    @Body() update: UpdateAppDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteDomainApps)
  @Cache(Collection.Apps, 'flush')
  @ApiResponse({ type: AppDataSerializer })
  @SetPolicy(Action.Update, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<App>,
    @Body() update: UpdateAppDto,
  ): Observable<AppDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
