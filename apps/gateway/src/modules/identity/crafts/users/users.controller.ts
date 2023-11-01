import {
  ControllerInterface,
  GrpcServiceProvider,
  Metadata,
} from '@app/common/interfaces';
import { DataSerializer, TotalSerializer, UserSerializer } from '@app/common/serializers';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, QueryFilterDto } from '@app/common/dto';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { User, UserDocument } from '@app/common/schemas';
import { IdentityProvider } from '@app/common/providers';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController
  extends GrpcController<User>
  implements ControllerInterface<User, UserDocument, GrpcServiceProvider<User>>
{
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
  ): Observable<DataSerializer<User>> {
    return super.create(meta, data, session);
  }
}
