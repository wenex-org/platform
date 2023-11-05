import {
  TotalSerializer,
  SessionDataSerializer,
  SessionItemsSerializer,
  SessionSerializer,
} from '@app/common/serializers';
import {
  CreateSessionDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSessionDto,
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
  UsePipes,
} from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Metadata, SessionDom, SessionSer } from '@app/common/interfaces';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('sessions')
@Controller('sessions')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class SessionsController extends GrpcController<SessionDom, SessionSer> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, () => SessionSerializer);
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
    @Body() data: CreateSessionDto,
    @Session() session?: ClientSession,
  ): Observable<SessionDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateSessionDto[],
    @Session() session?: ClientSession,
  ): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @ApiQuery({ type: FilterDto, required: false })
  Find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SessionDom>,
    @Session() session?: ClientSession,
  ): Observable<SessionItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @ApiQuery({ type: FilterDto, required: false })
  Cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SessionDom>,
    @Session() session?: ClientSession,
  ): Observable<SessionSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SessionDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SessionDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @ApiQuery({ type: String, name: 'ref', required: false })
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SessionDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @ApiQuery({ type: String, name: 'ref', required: false })
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<SessionDom>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ApiQuery({ type: String, name: 'ref', required: false })
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<SessionDom>,
    @Body() update: UpdateSessionDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ApiQuery({ type: QueryFilterDto, required: false })
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<SessionDom>,
    @Body() update: UpdateSessionDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
