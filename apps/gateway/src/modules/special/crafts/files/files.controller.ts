import {
  TotalSerializer,
  FileDataSerializer,
  FileItemsSerializer,
  FileSerializer,
} from '@app/common/serializers';
import {
  CreateFileDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateFileDto,
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
  File,
  FileDto,
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
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('files')
@Controller('files')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesController
  extends ControllerClass<File, FileDto>
  implements ControllerInterface<File, FileDto>
{
  constructor(readonly provider: SpecialProvider) {
    super(provider.files, () => FileSerializer);
  }

  @Get('count')
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
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
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateFileDto,
    @Session() session?: ClientSession,
  ): Observable<FileDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @ApiBody({ type: [CreateFileDto] })
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createBulk(
    @Meta() meta: Metadata,
    @Body() items: CreateFileDto[],
    @Session() session?: ClientSession,
  ): Observable<FileItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Get()
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
  ): Observable<FileItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
  ): Observable<FileSerializer> {
    return super.cursor(meta, filter, session);
  }

  @Get(':id')
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @ApiQuery({ type: FilterOneDto, required: false })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('files', 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Body() update: UpdateFileDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('files', 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<File>,
    @Body() update: UpdateFileDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
