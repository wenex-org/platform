import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { MessageDataSerializer, MessageItemsSerializer, MessageSerializer } from '@app/common/serializers/conjoint';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateMessageDto, CreateMessageItemsDto, UpdateMessageDto } from '@app/common/dto/conjoint';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { SearchDataSerializer, SearchSerializer } from '@app/common/core/serializers/elastic';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { getSseMessage, mapToInstance } from '@app/common/core/utils';
import { Message, MessageDto } from '@app/common/interfaces/conjoint';
import { ConjointProvider } from '@app/common/providers/conjoint';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { SearchRequestDto } from '@app/common/core/dto/elastic';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { from, Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('messages', 'conjoint');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('conjoint', 'messages')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MessagesController extends ControllerClass<Message, MessageDto> implements IController<Message, MessageDto> {
  constructor(readonly provider: ConjointProvider) {
    super(provider.messages, MessageSerializer);
  }

  @Post('search')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.SearchConjointMessages)
  @ApiResponse({ type: SearchDataSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Search, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  search(
    @Meta() meta: Metadata,
    @Body() request: SearchRequestDto,
    @Filter() filter: FilterDto<Message>,
  ): Observable<SearchDataSerializer<Message>> {
    return from(this.provider.messages.search(filter, request, { meta })).pipe(mapToInstance(SearchSerializer, 'data'));
  }

  // ##############################
  // Common Method's
  // ##############################

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/messages', 'create')
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Create, Resource.ConjointMessages)
  override create(@Meta() meta: Metadata, @Body() data: CreateMessageDto): Observable<MessageDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/messages', 'create')
  @ApiResponse({ type: MessageItemsSerializer })
  @SetPolicy(Action.Create, Resource.ConjointMessages)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateMessageItemsDto): Observable<MessageItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @ApiResponse({ type: MessageItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Message>): Observable<MessageItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadConjointMessages)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: MessageSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Message>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Message>): Observable<MessageDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Delete, Resource.ConjointMessages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Message>): Observable<MessageDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Restore, Resource.ConjointMessages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Message>): Observable<MessageDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMessages)
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Destroy, Resource.ConjointMessages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Message>): Observable<MessageDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMessages)
  @Validation('conjoint/messages', 'update')
  @SetPolicy(Action.Update, Resource.ConjointMessages)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Message>,
    @Body() update: UpdateMessageDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @Validation('conjoint/messages', 'update')
  @ApiResponse({ type: MessageDataSerializer })
  @SetPolicy(Action.Update, Resource.ConjointMessages)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Message>,
    @Body() update: UpdateMessageDto,
  ): Observable<MessageDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
