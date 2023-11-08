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
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Metadata, ConfigDom, ConfigSer } from '@app/common/interfaces';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Filter, Meta, Session } from '@app/common/decorators';
import { GatewayInterceptors } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ConfigProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('configs')
@Controller('configs')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsController extends GrpcController<ConfigDom, ConfigSer> {
  constructor(readonly provider: ConfigProvider) {
    super(provider.configs, () => ConfigSerializer);
  }

  @Get('count')
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() config?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, config);
  }

  @Post()
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateConfigDto,
    @Session() config?: ClientSession,
  ): Observable<ConfigDataSerializer> {
    return super.create(meta, data, config);
  }

  @Post('bulk')
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateConfigDto[],
    @Session() config?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, items, config);
  }

  @Get()
  @ApiQuery({ type: FilterDto, required: false })
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter, config);
  }

  @Get('cursor')
  @ApiQuery({ type: FilterDto, required: false })
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
  ): Observable<ConfigSerializer> {
    return super.cursor(meta, filter, config);
  }

  @Get(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, config);
  }

  @Delete(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, config);
  }

  @Put(':id/restore')
  @ApiQuery({ type: String, name: 'ref', required: false })
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, config);
  }

  @Delete(':id/destroy')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, config);
  }

  @Patch(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ConfigDom>,
    @Body() update: UpdateConfigDto,
    @Session() config?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, config);
  }

  @Patch('bulk')
  @ApiQuery({ type: QueryFilterDto, required: false })
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<ConfigDom>,
    @Body() update: UpdateConfigDto,
    @Session() config?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, config);
  }
}
