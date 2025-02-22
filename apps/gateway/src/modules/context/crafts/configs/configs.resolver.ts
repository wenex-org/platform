import { ConfigDataSerializer, ConfigItemsSerializer, ConfigSerializer } from '@app/common/serializers/context';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateConfigDto, CreateConfigItemsDto, UpdateConfigDto } from '@app/common/dto/context';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Config, ConfigDto } from '@app/common/interfaces/context';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ContextProvider } from '@app/common/providers/context';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => ConfigSerializer)
@RateLimit('configs')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsResolver extends ControllerClass<Config, ConfigDto> implements IController<Config, ConfigDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.configs, ConfigSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  countConfig(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  createConfig(@Meta() meta: Metadata, @Args('data') data: CreateConfigDto): Observable<ConfigDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ConfigItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContextConfigs)
  createConfigBulk(@Meta() meta: Metadata, @Args('data') data: CreateConfigItemsDto): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ConfigItemsSerializer)
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConfig(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Config>): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConfigById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Delete, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteConfigById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Restore, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreConfigById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Destroy, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyConfigById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConfigBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateConfigDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Config>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ConfigDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConfigById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Args('data') update: UpdateConfigDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
