import {
  TotalSerializer,
  AppDataSerializer,
  AppItemsSerializer,
  AppSerializer,
} from '@app/common/serializers';
import {
  CreateAppDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateAppDto,
} from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Metadata, AppDom, AppSer } from '@app/common/interfaces';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { DomainProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => AppSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class AppsResolver extends GrpcController<AppDom, AppSer> {
  constructor(readonly provider: DomainProvider) {
    super(provider.apps, () => AppSerializer);
  }

  @Query(() => TotalSerializer)
  countApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  createApp(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAppDto,
    @Session() session?: ClientSession,
  ): Observable<AppDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => AppItemsSerializer)
  createBulkApp(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateAppDto] }) items: CreateAppDto[],
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => AppItemsSerializer)
  findApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
  ): Observable<AppItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => AppDataSerializer)
  findOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<AppDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  deleteOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  restoreOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  destroyOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<AppDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => AppDataSerializer)
  updateOneApp(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<AppDom>,
    @Args('data') update: UpdateAppDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<AppDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  updateBulkApp(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<AppDom>,
    @Args('data') update: UpdateAppDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
