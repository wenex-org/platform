import {
  TotalSerializer,
  GrantDataSerializer,
  GrantItemsSerializer,
  GrantSerializer,
} from '@app/common/serializers';
import {
  CreateGrantDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateGrantDto,
} from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Metadata, GrantDom, GrantSer } from '@app/common/interfaces';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { AuthProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => GrantSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class GrantsResolver extends GrpcController<GrantDom, GrantSer> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, () => GrantSerializer);
  }

  @Query(() => TotalSerializer)
  countGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() grant?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, grant);
  }

  @Mutation(() => GrantDataSerializer)
  createGrant(
    @Meta() meta: Metadata,
    @Args('data') data: CreateGrantDto,
    @Session() grant?: ClientSession,
  ): Observable<GrantDataSerializer> {
    return super.create(meta, data, grant);
  }

  @Mutation(() => GrantItemsSerializer)
  createBulkGrant(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateGrantDto] }) items: CreateGrantDto[],
    @Session() grant?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, items, grant);
  }

  @Query(() => GrantItemsSerializer)
  findGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
  ): Observable<GrantItemsSerializer> {
    return super.find(meta, filter, grant);
  }

  @Query(() => GrantDataSerializer)
  findOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, grant);
  }

  @Mutation(() => GrantDataSerializer)
  deleteOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, grant);
  }

  @Mutation(() => GrantDataSerializer)
  restoreOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, grant);
  }

  @Mutation(() => GrantDataSerializer)
  destroyOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<GrantDom>,
    @Session() grant?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, grant);
  }

  @Mutation(() => GrantDataSerializer)
  updateOneGrant(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<GrantDom>,
    @Args('data') update: UpdateGrantDto,
    @Session() grant?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, grant);
  }

  @Mutation(() => TotalSerializer)
  updateBulkGrant(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<GrantDom>,
    @Args('data') update: UpdateGrantDto,
    @Session() grant?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, grant);
  }
}
