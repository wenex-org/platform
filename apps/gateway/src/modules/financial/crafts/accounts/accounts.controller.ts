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
import { AccountDataSerializer, AccountItemsSerializer, AccountSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateAccountDto, CreateAccountItemsDto, UpdateAccountDto } from '@app/common/dto/financial';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Account, AccountDto } from '@app/common/interfaces/financial';
import { FinancialProvider } from '@app/common/providers/financial';
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
@RateLimit('accounts')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Accounts)
@Controller(Collection.Accounts)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AccountsController extends ControllerClass<Account, AccountDto> implements IController<Account, AccountDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.accounts, AccountSerializer);
  }

  @Get('count')
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  override create(@Meta() meta: Metadata, @Body() data: CreateAccountDto): Observable<AccountDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: AccountItemsSerializer })
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateAccountItemsDto): Observable<AccountItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiResponse({ type: AccountItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: AccountSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Account>) {
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
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Account>): Observable<AccountDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Account>,
    @Body() update: UpdateAccountDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @ApiResponse({ type: AccountDataSerializer })
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Body() update: UpdateAccountDto,
  ): Observable<AccountDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
