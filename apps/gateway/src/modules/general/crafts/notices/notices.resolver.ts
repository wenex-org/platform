import { NoticeDataSerializer, NoticeItemsSerializer, NoticeSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateNoticeDto, CreateNoticeItemsDto, UpdateNoticeDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Notice, NoticeDto } from '@app/common/interfaces/general';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => NoticeSerializer)
@RateLimit('notices')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class NoticesResolver extends ControllerClass<Notice, NoticeDto> implements IController<Notice, NoticeDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.notices, NoticeSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Notices, 'fill')
  @SetScope(Scope.ReadGeneralNotices)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  countNotice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralNotices)
  createNotice(@Meta() meta: Metadata, @Args('data') data: CreateNoticeDto): Observable<NoticeDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => NoticeItemsSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralNotices)
  createNoticeBulk(@Meta() meta: Metadata, @Args('data') data: CreateNoticeItemsDto): Observable<NoticeItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => NoticeItemsSerializer)
  @Cache(Collection.Notices, 'fill')
  @SetScope(Scope.ReadGeneralNotices)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findNotice(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Notice>): Observable<NoticeItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'fill')
  @SetScope(Scope.ReadGeneralNotices)
  @SetPolicy(Action.Read, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findNoticeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Notice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoticeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @SetPolicy(Action.Delete, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteNoticeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Notice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoticeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @SetPolicy(Action.Restore, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreNoticeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Notice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoticeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.ManageGeneralNotices)
  @SetPolicy(Action.Destroy, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyNoticeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Notice>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoticeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.ManageGeneralNotices)
  @SetPolicy(Action.Update, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateNoticeBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateNoticeDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Notice>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => NoticeDataSerializer)
  @Cache(Collection.Notices, 'flush')
  @SetScope(Scope.WriteGeneralNotices)
  @SetPolicy(Action.Update, Resource.GeneralNotices)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateNoticeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Notice>,
    @Args('data') update: UpdateNoticeDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoticeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
