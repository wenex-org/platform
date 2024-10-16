import { CreateConfigDto, CreateConfigItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateConfigDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, ConfigDataSerializer, ConfigItemsSerializer, ConfigSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Config, ConfigDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ContextProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => ConfigSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ConfigsResolver extends ControllerClass<Config, ConfigDto> implements ControllerInterface<Config, ConfigDto> {
  constructor(readonly provider: ContextProvider) {
    super(provider.configs, () => ConfigSerializer);
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
  createBulkConfig(@Meta() meta: Metadata, @Args('data') data: CreateConfigItemsDto): Observable<ConfigItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ConfigItemsSerializer)
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findConfig(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Config>): Observable<ConfigItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'fill')
  @SetScope(Scope.ReadContextConfigs)
  @SetPolicy(Action.Read, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Delete, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Restore, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Destroy, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Config>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => ConfigDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.WriteContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneConfig(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Config>,
    @Args('data') update: UpdateConfigDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ConfigDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Configs, 'flush')
  @SetScope(Scope.ManageContextConfigs)
  @SetPolicy(Action.Update, Resource.ContextConfigs)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkConfig(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Config>,
    @Args('data') update: UpdateConfigDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
