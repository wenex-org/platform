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
import {
  Controller as ControllerInterface,
  Metadata,
  Grant,
  GrantDto,
} from '@app/common/interfaces';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { AuthProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('grants')
@Controller('grants')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsController
  extends ControllerClass<Grant, GrantDto>
  implements ControllerInterface<Grant, GrantDto>
{
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
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateGrantDto,
    @Session() session?: ClientSession,
  ): Observable<GrantDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @Cache('grants', 'flush')
  @SetScope(Scope.WriteAuthGrants)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateGrantDto[],
    @Session() session?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('grants', 'fill')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
  ): Observable<GrantSerializer> {
    return super.cursor(meta, filter, session);
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
    @Filter() filter: FilterOneDto<Grant>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
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
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
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
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
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
    @Filter() filter: FilterDto<Grant>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
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
    @Filter() filter: FilterOneDto<Grant>,
    @Body() update: UpdateGrantDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @Cache('grants', 'flush')
  @SetScope(Scope.ManageAuthGrants)
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Grant>,
    @Body() update: UpdateGrantDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
