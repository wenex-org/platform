import {
  TotalSerializer,
  SettingDataSerializer,
  SettingItemsSerializer,
  SettingSerializer,
} from '@app/common/serializers';
import {
  CreateSettingDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSettingDto,
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
  Setting,
  SettingDto,
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
@ApiTags('settings')
@Controller('settings')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SettingsController
  extends ControllerClass<Setting, SettingDto>
  implements ControllerInterface<Setting, SettingDto>
{
  constructor(readonly provider: ConfigProvider) {
    super(provider.settings, () => SettingSerializer);
  }

  @Get('count')
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
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
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigSettings)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateSettingDto,
    @Session() session?: ClientSession,
  ): Observable<SettingDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @ApiBody({ type: [CreateSettingDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigSettings)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateSettingDto[],
    @Session() session?: ClientSession,
  ): Observable<SettingItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
  ): Observable<SettingItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadConfigSettings)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
  ): Observable<SettingSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Delete, Resource.ConfigSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Restore, Resource.ConfigSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('settings', 'flush')
  @SetScope(Scope.ManageConfigSettings)
  @SetPolicy(Action.Destroy, Resource.ConfigSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Update, Resource.ConfigSettings)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Body() update: UpdateSettingDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('settings', 'flush')
  @SetScope(Scope.ManageConfigSettings)
  @SetPolicy(Action.Update, Resource.ConfigSettings)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Setting>,
    @Body() update: UpdateSettingDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
