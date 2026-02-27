import { MessageDataSerializer, MessageItemsSerializer, MessageSerializer } from '@app/common/serializers/conjoint';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateMessageDto, CreateMessageItemsDto, UpdateMessageDto } from '@app/common/dto/conjoint';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Message, MessageDto } from '@app/common/interfaces/conjoint';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ConjointProvider } from '@app/common/providers/conjoint';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('messages', 'conjoint');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MessagesResolver extends ControllerClass<Message, MessageDto> implements IController<Message, MessageDto> {
  constructor(readonly provider: ConjointProvider) {
    super(provider.messages, MessageSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  countConjointMessage(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => MessageDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/messages', 'create')
  @SetPolicy(Action.Create, Resource.ConjointMessages)
  createConjointMessage(@Meta() meta: Metadata, @Args('data') data: CreateMessageDto): Observable<MessageDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => MessageItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/messages', 'create')
  @SetPolicy(Action.Create, Resource.ConjointMessages)
  createConjointMessageBulk(@Meta() meta: Metadata, @Args('data') data: CreateMessageItemsDto): Observable<MessageItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => MessageItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointMessage(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Message>,
  ): Observable<MessageItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => MessageDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMessages)
  @SetPolicy(Action.Read, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointMessageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Message>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MessageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => MessageDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @SetPolicy(Action.Delete, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteConjointMessageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Message>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MessageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => MessageDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @SetPolicy(Action.Restore, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreConjointMessageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Message>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MessageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => MessageDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMessages)
  @SetPolicy(Action.Destroy, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyConjointMessageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Message>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MessageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMessages)
  @Validation('conjoint/messages', 'update')
  @SetPolicy(Action.Update, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointMessageBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateMessageDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Message>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => MessageDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMessages)
  @Validation('conjoint/messages', 'update')
  @SetPolicy(Action.Update, Resource.ConjointMessages)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointMessageById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Message>,
    @Args('data') update: UpdateMessageDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MessageDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
