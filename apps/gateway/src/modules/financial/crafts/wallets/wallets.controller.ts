import {
  TotalSerializer,
  WalletDataSerializer,
  WalletItemsSerializer,
  WalletSerializer,
} from '@app/common/serializers';
import {
  CreateWalletDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateWalletDto,
} from '@app/common/dto';
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
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  Wallet,
  WalletDto,
} from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { FinancialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('wallets')
@Controller('wallets')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WalletsController
  extends ControllerClass<Wallet, WalletDto>
  implements ControllerInterface<Wallet, WalletDto>
{
  constructor(readonly provider: FinancialProvider) {
    super(provider.wallets, () => WalletSerializer);
  }

  @Get('count')
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateWalletDto,
    @Session() session?: ClientSession,
  ): Observable<WalletDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @ApiBody({ type: [CreateWalletDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialWallets)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateWalletDto[],
    @Session() session?: ClientSession,
  ): Observable<WalletItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Session() session?: ClientSession,
  ): Observable<WalletItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Session() session?: ClientSession,
  ): Observable<WalletSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('wallets', 'fill')
  @SetScope(Scope.ReadFinancialWallets)
  @SetPolicy(Action.Read, Resource.FinancialWallets)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Delete, Resource.FinancialWallets)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Restore, Resource.FinancialWallets)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('wallets', 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Destroy, Resource.FinancialWallets)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Wallet>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('wallets', 'flush')
  @SetScope(Scope.WriteFinancialWallets)
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Wallet>,
    @Body() update: UpdateWalletDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<WalletDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('wallets', 'flush')
  @SetScope(Scope.ManageFinancialWallets)
  @SetPolicy(Action.Update, Resource.FinancialWallets)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Wallet>,
    @Body() update: UpdateWalletDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
