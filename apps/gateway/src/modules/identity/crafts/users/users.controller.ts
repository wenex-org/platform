import {
  TotalSerializer,
  UserDataSerializer,
  UserItemsSerializer,
  UserSerializer,
} from '@app/common/serializers';
import {
  CreateUserDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateUserDto,
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
import { Metadata, UserDom, UserSer } from '@app/common/interfaces';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Filter, Meta, Session } from '@app/common/decorators';
import { GatewayInterceptors } from '@app/common/interceptors';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class UsersController extends GrpcController<UserDom, UserSer> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, () => UserSerializer);
  }

  @Get('count')
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  Count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  Create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  CreateBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateUserDto[],
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @ApiQuery({ type: FilterDto, required: false })
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @ApiQuery({ type: FilterDto, required: false })
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
  ): Observable<UserSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<UserDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('users', 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @ApiQuery({ type: String, name: 'ref', required: false })
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<UserDom>,
    @Body() update: UpdateUserDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @ApiQuery({ type: QueryFilterDto, required: false })
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<UserDom>,
    @Body() update: UpdateUserDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
