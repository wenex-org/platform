import {
  TotalSerializer,
  GrantDataSerializer,
  GrantItemsSerializer,
  GrantSerializer,
} from '@app/common/serializers';
import {
  CreateGrantDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateGrantDto,
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
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Metadata, GrantDom, GrantSer } from '@app/common/interfaces';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { AuthProvider } from '@app/common/providers';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('grants')
@Controller('grants')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsController extends GrpcController<GrantDom, GrantSer> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, () => GrantSerializer);
  }

  @Get('count')
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() grant?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, grant);
  }

  @Post()
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
    @Session() grant?: ClientSession,
  ): Observable<GrantDataSerializer> {
    return super.create(meta, data, grant);
  }

  @Post('bulk')
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateGrantDto[],
    @Session() grant?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, items, grant);
  }

  @Get()
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.find(meta, filter, grant);
  }

  @Get('cursor')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
  ): Observable<GrantSerializer> {
    return super.cursor(meta, filter, grant);
  }

  @Get(':id')
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, grant);
  }

  @Delete(':id')
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, grant);
  }

  @Put(':id/restore')
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, grant);
  }

  @Delete(':id/destroy')
  @Cache('grants', 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, grant);
  }

  @Patch(':id')
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<GrantDom>,
    @Body() update: UpdateGrantDto,
    @Session() grant?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, grant);
  }

  @Patch('bulk')
  @Cache('grants', 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<GrantDom>,
    @Body() update: UpdateGrantDto,
    @Session() grant?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, grant);
  }
}
