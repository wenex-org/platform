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
import { CreateMailDto, CreateMailItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateMailDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, MailDataSerializer, MailItemsSerializer, MailSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Mail, MailDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Mails)
@Controller(Collection.Mails)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MailsController extends ControllerClass<Mail, MailDto> implements ControllerInterface<Mail, MailDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.mails, () => MailSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchMails)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  create(@Meta() meta: Metadata, @Body() data: CreateMailDto): Observable<MailDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateMailItemsDto): Observable<MailItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @SetPolicy(Action.Read, Resource.TouchMails)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Mail>): Observable<MailItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadTouchMails)
  @SetPolicy(Action.Read, Resource.TouchMails)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  cursor(@Meta() meta: Metadata, @Filter() filter: FilterDto<Mail>): Observable<MailSerializer> {
    return super.cursor(meta, filter);
  }

  @Get(':id')
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @SetPolicy(Action.Read, Resource.TouchMails)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Delete, Resource.TouchMails)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Restore, Resource.TouchMails)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Mails, 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Destroy, Resource.TouchMails)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Update, Resource.TouchMails)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Body() update: UpdateMailDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Mails, 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Update, Resource.TouchMails)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Mail>,
    @Body() update: UpdateMailDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
