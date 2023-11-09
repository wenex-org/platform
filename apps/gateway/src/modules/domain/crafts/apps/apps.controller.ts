import {
  TotalSerializer,
  AppDataSerializer,
  AppItemsSerializer,
  AppSerializer,
} from '@app/common/serializers';
import {
  CreateAppDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateAppDto,
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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Metadata, AppDom, AppSer } from '@app/common/interfaces';
import { Filter, Meta, Session } from '@app/common/decorators';
import { GatewayInterceptors } from '@app/common/interceptors';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('apps')
@Controller('apps')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AppsController extends GrpcController<AppDom, AppSer> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, () => AppSerializer);
  }

  @Get('count')
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: QueryFilterDto, required: false })
  Count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Create, Resource.DomainApps)
  Create(
    @Meta() meta: Metadata,
    @Body() data: CreateAppDto,
    @Session() session?: ClientSession,
  ): Observable<AppDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Create, Resource.DomainApps)
  CreateBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateAppDto[],
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: FilterDto, required: false })
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: FilterDto, required: false })
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
  ): Observable<AppSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('apps', 'fill')
  @SetScope(Scope.ReadDomainApps)
  @SetPolicy(Action.Read, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<AppDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Delete, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Restore, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('apps', 'flush')
  @SetScope(Scope.ManageDomainApps)
  @SetPolicy(Action.Destroy, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @ApiQuery({ type: String, name: 'ref', required: false })
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<AppDom>,
    @Body() update: UpdateAppDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @Cache('apps', 'flush')
  @SetScope(Scope.WriteDomainApps)
  @SetPolicy(Action.Update, Resource.DomainApps)
  @ApiQuery({ type: QueryFilterDto, required: false })
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<AppDom>,
    @Body() update: UpdateAppDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
