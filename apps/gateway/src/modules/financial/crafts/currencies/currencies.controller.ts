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
import { CurrencyDataSerializer, CurrencyItemsSerializer, CurrencySerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateCurrencyDto, CreateCurrencyItemsDto, UpdateCurrencyDto } from '@app/common/dto/financial';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Currency, CurrencyDto } from '@app/common/interfaces/financial';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { FinancialProvider } from '@app/common/providers/financial';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('currencies', 'financial');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@ApiTags('financial', 'currencies')
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CurrenciesController extends ControllerClass<Currency, CurrencyDto> implements IController<Currency, CurrencyDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.currencies, CurrencySerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Create, Resource.FinancialCurrencies)
  override create(@Meta() meta: Metadata, @Body() data: CreateCurrencyDto): Observable<CurrencyDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: CurrencyItemsSerializer })
  @SetPolicy(Action.Create, Resource.FinancialCurrencies)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateCurrencyItemsDto): Observable<CurrencyItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @ApiResponse({ type: CurrencyItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Currency>): Observable<CurrencyItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialCurrencies)
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: CurrencySerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Currency>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadFinancialCurrencies)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Read, Resource.FinancialCurrencies)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Currency>): Observable<CurrencyDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Delete, Resource.FinancialCurrencies)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Currency>): Observable<CurrencyDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Restore, Resource.FinancialCurrencies)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Currency>): Observable<CurrencyDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialCurrencies)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Destroy, Resource.FinancialCurrencies)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Currency>): Observable<CurrencyDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageFinancialCurrencies)
  @SetPolicy(Action.Update, Resource.FinancialCurrencies)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Currency>,
    @Body() update: UpdateCurrencyDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteFinancialCurrencies)
  @ApiResponse({ type: CurrencyDataSerializer })
  @SetPolicy(Action.Update, Resource.FinancialCurrencies)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Currency>,
    @Body() update: UpdateCurrencyDto,
  ): Observable<CurrencyDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
