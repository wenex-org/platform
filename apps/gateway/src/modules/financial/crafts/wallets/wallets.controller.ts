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
import { WalletDataSerializer, WalletItemsSerializer, WalletSerializer } from '@app/common/serializers/financial';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateWalletDto, CreateWalletItemsDto, UpdateWalletDto } from '@app/common/dto/financial';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Wallet, WalletDto } from '@app/common/interfaces/financial';
import { FinancialProvider } from '@app/common/providers/financial';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Permission } from 'abacl';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('wallets')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Wallets)
@Controller(Collection.Wallets)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WalletsController extends ControllerClass<Wallet, WalletDto> implements IController<Wallet, WalletDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.wallets, WalletSerializer);
  }

  @Get('count')
  @Cache(Collection.Wallets, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  override create(@Meta() meta: Metadata, @Body() data: CreateWalletDto): Observable<WalletDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: WalletItemsSerializer })
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateWalletItemsDto): Observable<WalletItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Wallets, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiResponse({ type: WalletItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Wallet>): Observable<WalletItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: WalletSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Wallet>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, perm, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @Cache(Collection.Wallets, 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Wallet>): Observable<WalletDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Delete, Resource.FinancialWallets)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Wallet>): Observable<WalletDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Restore, Resource.FinancialWallets)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Wallet>): Observable<WalletDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Destroy, Resource.FinancialWallets)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Wallet>): Observable<WalletDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Wallet>,
    @Body() update: UpdateWalletDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(Collection.Wallets, 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @ApiResponse({ type: WalletDataSerializer })
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Body() update: UpdateWalletDto,
  ): Observable<WalletDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
