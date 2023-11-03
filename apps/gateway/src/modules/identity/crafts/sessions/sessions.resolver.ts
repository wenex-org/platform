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
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Metadata, Session as ISession } from '@app/common/interfaces';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => SessionSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class SessionsResolver extends GrpcController<ISession> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.sessions, () => SessionSerializer);
  }

  @Query(() => TotalSerializer)
  countSession(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => SessionDataSerializer)
  createSession(
    @Meta() meta: Metadata,
    @Args('data') data: CreateSessionDto,
    @Session() session?: ClientSession,
  ): Observable<SessionDataSerializer> {
    return super.create(meta, data as ISession, session);
  }

  @Mutation(() => SessionItemsSerializer)
  createBulkSession(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateSessionDto] }) items: CreateSessionDto[],
    @Session() session?: ClientSession,
  ): Observable<SessionItemsSerializer> {
    return super.createBulk(meta, items as ISession[], session);
  }

  @Query(() => SessionItemsSerializer)
  findSession(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<ISession>,
    @Session() session?: ClientSession,
  ): Observable<SessionItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => SessionDataSerializer)
  findOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ISession>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => SessionDataSerializer)
  deleteOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => SessionDataSerializer)
  restoreOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => SessionDataSerializer)
  destroyOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ISession>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => SessionDataSerializer)
  updateOneSession(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ISession>,
    @Args('data') update: UpdateSessionDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SessionDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  updateBulkSession(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<ISession>,
    @Args('data') update: UpdateSessionDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
