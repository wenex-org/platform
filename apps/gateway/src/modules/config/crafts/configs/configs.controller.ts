import {
  TotalSerializer,
  ConfigDataSerializer,
  ConfigItemsSerializer,
  ConfigSerializer,
} from '@app/common/serializers';
import {
  CreateConfigDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateConfigDto,
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
  Config,
  ConfigDto,
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
import { ConfigProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('configs')
@Controller('configs')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsController
  extends ControllerClass<Config, ConfigDto>
  implements ControllerInterface<Config, ConfigDto>
{
  constructor(readonly provider: ConfigProvider) {
    super(provider.configs, () => ConfigSerializer);
  }

  @Get('count')
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadConfigConfigs)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConfigConfigs)
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
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteConfigConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigConfigs)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
    @Session() session?: ClientSession,
  ): Observable<ConfigDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteConfigConfigs)
  @ApiBody({ type: [CreateConfigDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigConfigs)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateConfigDto[],
    @Session() session?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadConfigConfigs)
  @SetPolicy(Action.Read, Resource.ConfigConfigs)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadConfigConfigs)
  @SetPolicy(Action.Read, Resource.ConfigConfigs)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
  ): Observable<ConfigSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('configs', 'fill')
  @SetScope(Scope.ReadConfigConfigs)
  @SetPolicy(Action.Read, Resource.ConfigConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteConfigConfigs)
  @SetPolicy(Action.Delete, Resource.ConfigConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteConfigConfigs)
  @SetPolicy(Action.Restore, Resource.ConfigConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('configs', 'flush')
  @SetScope(Scope.ManageConfigConfigs)
  @SetPolicy(Action.Destroy, Resource.ConfigConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('configs', 'flush')
  @SetScope(Scope.WriteConfigConfigs)
  @SetPolicy(Action.Update, Resource.ConfigConfigs)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Body() update: UpdateConfigDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('configs', 'flush')
  @SetScope(Scope.ManageConfigConfigs)
  @SetPolicy(Action.Update, Resource.ConfigConfigs)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Config>,
    @Body() update: UpdateConfigDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
