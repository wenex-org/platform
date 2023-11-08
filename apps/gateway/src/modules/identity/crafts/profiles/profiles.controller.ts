import {
  TotalSerializer,
  ProfileDataSerializer,
  ProfileItemsSerializer,
  ProfileSerializer,
} from '@app/common/serializers';
import {
  CreateProfileDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateProfileDto,
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
import { Metadata, ProfileDom, ProfileSer } from '@app/common/interfaces';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Filter, Meta, Session } from '@app/common/decorators';
import { GatewayInterceptors } from '@app/common/interceptors';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('profiles')
@Controller('profiles')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProfilesController extends GrpcController<ProfileDom, ProfileSer> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, () => ProfileSerializer);
  }

  @Get('count')
  @ApiQuery({ type: QueryFilterDto, required: false })
  Count(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  Create(
    @Meta() meta: Metadata,
    @Body() data: CreateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<ProfileDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  CreateBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateProfileDto[],
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @ApiQuery({ type: FilterDto, required: false })
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ProfileDom>,
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @ApiQuery({ type: FilterDto, required: false })
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ProfileDom>,
    @Session() session?: ClientSession,
  ): Observable<ProfileSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ProfileDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ProfileDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @ApiQuery({ type: String, name: 'ref', required: false })
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ProfileDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ProfileDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ProfileDom>,
    @Body() update: UpdateProfileDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ApiQuery({ type: QueryFilterDto, required: false })
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<ProfileDom>,
    @Body() update: UpdateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
