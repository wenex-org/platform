import { GatewayInterceptors, WriteInterceptors, ResponseInterceptors } from '@app/common/core/interceptors';
import { SmsDataSerializer, SmsItemsSerializer, SmsSerializer } from '@app/common/serializers/touch';
import { CreateSmsDto, CreateSmsItemsDto, UpdateSmsDto } from '@app/common/dto/touch';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { Sms, SmsDto } from '@app/common/interfaces/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('smss', 'touch');

@Resolver(() => SmsSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SmssResolver extends ControllerClass<Sms, SmsDto> implements IController<Sms, SmsDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.smss, SmsSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  countTouchSms(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchSmss)
  createTouchSms(@Meta() meta: Metadata, @Args('data') data: CreateSmsDto): Observable<SmsDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SmsItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchSmss)
  createTouchSmsBulk(@Meta() meta: Metadata, @Args('data') data: CreateSmsItemsDto): Observable<SmsItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SmsItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTouchSms(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Sms>): Observable<SmsItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadTouchSmss)
  @SetPolicy(Action.Read, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findTouchSmsById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sms>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SmsDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @SetPolicy(Action.Delete, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteTouchSmsById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sms>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SmsDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @SetPolicy(Action.Restore, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreTouchSmsById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sms>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SmsDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @SetPolicy(Action.Destroy, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyTouchSmsById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Sms>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SmsDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageTouchSmss)
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTouchSmsBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSmsDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Sms>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SmsDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteTouchSmss)
  @SetPolicy(Action.Update, Resource.TouchSmss)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateTouchSmsById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Sms>,
    @Args('data') update: UpdateSmsDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SmsDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
