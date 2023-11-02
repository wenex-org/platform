import {
  ControllerInterface,
  GrpcServiceProvider,
  Metadata,
  User,
} from '@app/common/interfaces';
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
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { GrpcController } from '@app/common/classes';
import { ParseIdPipe } from '@app/common/pipes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class UsersController extends GrpcController<User> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, () => UserSerializer);
  }

  @Get('count')
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateUserDto,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.create(meta, data as User, session);
  }

  @Post('bulk')
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateUserDto[],
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.createBulk(meta, items as User[], session);
  }

  @Get()
  @ApiQuery({ type: FilterDto, required: false })
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @ApiQuery({ type: FilterDto, required: false })
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserSerializer> {
    return super.cursor(meta, filter, session);
  }

  // @Param('id', ParseIdPipe) id: string,
  // @Query('ref') ref?: string,
  @Get(':id')
  findOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  deleteOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  restoreOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  destroyOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Body() update: UpdateUserDto,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ApiQuery({ type: QueryFilterDto, required: false })
  updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<User>,
    @Body() update: UpdateUserDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
