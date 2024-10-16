import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  CreateAccountDto,
  CreateAccountItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateAccountDto,
} from '@app/common/dto';
import { TotalSerializer, AccountDataSerializer, AccountItemsSerializer, AccountSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Account, AccountDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Accounts)
@Controller(Collection.Accounts)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AccountsController extends ControllerClass<Account, AccountDto> implements ControllerInterface<Account, AccountDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.accounts, () => AccountSerializer);
  }

  @Get('count')
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  create(@Meta() meta: Metadata, @Body() data: CreateAccountDto): Observable<AccountDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Accounts, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Create, Resource.FinancialAccounts)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateAccountItemsDto): Observable<AccountItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialAccounts)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Account>): Observable<AccountSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache(Collection.Accounts, 'fill')
  @SetScope(Scope.ReadFinancialAccounts)
  @SetPolicy(Action.Read, Resource.FinancialAccounts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Delete, Resource.FinancialAccounts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Restore, Resource.FinancialAccounts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Destroy, Resource.FinancialAccounts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Account>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.WriteFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Account>,
    @Body() update: UpdateAccountDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AccountDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Accounts, 'flush')
  @SetScope(Scope.ManageFinancialAccounts)
  @SetPolicy(Action.Update, Resource.FinancialAccounts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Account>,
    @Body() update: UpdateAccountDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
