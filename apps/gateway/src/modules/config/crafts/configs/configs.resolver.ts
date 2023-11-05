import {
  TotalSerializer,
  ConfigDataSerializer,
  ConfigItemsSerializer,
  ConfigSerializer,
} from '@app/common/serializers';
import {
  CreateConfigDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateConfigDto,
} from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Metadata, ConfigDom, ConfigSer } from '@app/common/interfaces';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ConfigProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => ConfigSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class ConfigsResolver extends GrpcController<ConfigDom, ConfigSer> {
  constructor(readonly provider: ConfigProvider) {
    super(provider.configs, () => ConfigSerializer);
  }

  @Query(() => TotalSerializer)
  countConfig(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() config?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, config);
  }

  @Mutation(() => ConfigDataSerializer)
  createConfig(
    @Meta() meta: Metadata,
    @Args('data') data: CreateConfigDto,
    @Session() config?: ClientSession,
  ): Observable<ConfigDataSerializer> {
    return super.create(meta, data, config);
  }

  @Mutation(() => ConfigItemsSerializer)
  createBulkConfig(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateConfigDto] }) items: CreateConfigDto[],
    @Session() config?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, items, config);
  }

  @Query(() => ConfigItemsSerializer)
  findConfig(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
  ): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter, config);
  }

  @Query(() => ConfigDataSerializer)
  findOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, config);
  }

  @Mutation(() => ConfigDataSerializer)
  deleteOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, config);
  }

  @Mutation(() => ConfigDataSerializer)
  restoreOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, config);
  }

  @Mutation(() => ConfigDataSerializer)
  destroyOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<ConfigDom>,
    @Session() config?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, config);
  }

  @Mutation(() => ConfigDataSerializer)
  updateOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<ConfigDom>,
    @Args('data') update: UpdateConfigDto,
    @Session() config?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, config);
  }

  @Mutation(() => TotalSerializer)
  updateBulkConfig(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<ConfigDom>,
    @Args('data') update: UpdateConfigDto,
    @Session() config?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, config);
  }
}
