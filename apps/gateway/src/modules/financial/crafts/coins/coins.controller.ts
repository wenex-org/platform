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
import { CreateCoinDto, CreateCoinItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateCoinDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, CoinDataSerializer, CoinItemsSerializer, CoinSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Coin, CoinDto } from '@app/common/interfaces';
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
@ApiTags(Collection.Coins)
@Controller(Collection.Coins)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CoinsController extends ControllerClass<Coin, CoinDto> implements ControllerInterface<Coin, CoinDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.coins, () => CoinSerializer);
  }

  @Get('count')
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  create(@Meta() meta: Metadata, @Body() data: CreateCoinDto): Observable<CoinDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateCoinItemsDto): Observable<CoinItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Coin>): Observable<CoinItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialCoins)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Coin>): Observable<CoinSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @Cache(Collection.Coins, 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Delete, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Restore, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Destroy, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Body() update: UpdateCoinDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Coins, 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Coin>,
    @Body() update: UpdateCoinDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
