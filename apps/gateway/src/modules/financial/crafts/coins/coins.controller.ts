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
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, CoinDataSerializer, CoinItemsSerializer, CoinSerializer } from '@app/common/serializers';
import { CreateCoinDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateCoinDto } from '@app/common/dto';
import { Controller as ControllerInterface, Metadata, Coin, CoinDto } from '@app/common/interfaces';
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
@ApiTags('coins')
@Controller('coins')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CoinsController extends ControllerClass<Coin, CoinDto> implements ControllerInterface<Coin, CoinDto> {
  constructor(readonly provider: FinancialProvider) {
    super(provider.coins, () => CoinSerializer);
  }

  @Get('count')
  @Cache('coins', 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('coins', 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  create(@Meta() meta: Metadata, @Body() data: CreateCoinDto, @Session() session?: ClientSession): Observable<CoinDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('coins', 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @ApiBody({ type: [CreateCoinDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.FinancialCoins)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateCoinDto[],
    @Session() session?: ClientSession,
  ): Observable<CoinItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('coins', 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Session() session?: ClientSession,
  ): Observable<CoinItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Session() session?: ClientSession,
  ): Observable<CoinSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('coins', 'fill')
  @SetScope(Scope.ReadFinancialCoins)
  @SetPolicy(Action.Read, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('coins', 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Delete, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('coins', 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Restore, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('coins', 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Destroy, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Coin>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('coins', 'flush')
  @SetScope(Scope.WriteFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Coin>,
    @Body() update: UpdateCoinDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<CoinDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('coins', 'flush')
  @SetScope(Scope.ManageFinancialCoins)
  @SetPolicy(Action.Update, Resource.FinancialCoins)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Coin>,
    @Body() update: UpdateCoinDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
