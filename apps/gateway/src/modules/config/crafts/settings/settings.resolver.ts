import {
  TotalSerializer,
  SettingDataSerializer,
  SettingItemsSerializer,
  SettingSerializer,
} from '@app/common/serializers';
import {
  CreateSettingDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateSettingDto,
} from '@app/common/dto';
import {
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  Setting,
  SettingDto,
} from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ConfigProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => SettingSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SettingsResolver
  extends ControllerClass<Setting, SettingDto>
  implements ControllerInterface<Setting, SettingDto>
{
  constructor(readonly provider: ConfigProvider) {
    super(provider.settings, () => SettingSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  countSetting(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => SettingDataSerializer)
  @ShipStrategy('create')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigSettings)
  createSetting(
    @Meta() meta: Metadata,
    @Args('data') data: CreateSettingDto,
    @Session() session?: ClientSession,
  ): Observable<SettingDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => SettingItemsSerializer)
  @ShipStrategy('create')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConfigSettings)
  createBulkSetting(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateSettingDto] }) items: CreateSettingDto[],
    @Session() session?: ClientSession,
  ): Observable<SettingItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => SettingItemsSerializer)
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findSetting(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
  ): Observable<SettingItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => SettingDataSerializer)
  @Cache('settings', 'fill')
  @SetScope(Scope.ReadConfigSettings)
  @SetPolicy(Action.Read, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Delete, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Restore, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => SettingDataSerializer)
  @Cache('settings', 'flush')
  @SetScope(Scope.ManageConfigSettings)
  @SetPolicy(Action.Destroy, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Setting>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => SettingDataSerializer)
  @ShipStrategy('update')
  @Cache('settings', 'flush')
  @SetScope(Scope.WriteConfigSettings)
  @SetPolicy(Action.Update, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneSetting(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Setting>,
    @Args('data') update: UpdateSettingDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<SettingDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('settings', 'flush')
  @SetScope(Scope.ManageConfigSettings)
  @SetPolicy(Action.Update, Resource.ConfigSettings)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkSetting(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Setting>,
    @Args('data') update: UpdateSettingDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
