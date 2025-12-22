import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { AptDataSerializer, AptItemsSerializer, AptSerializer } from '@app/common/serializers/auth';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { CreateAptDto, CreateAptItemsDto } from '@app/common/dto/auth';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { AuthProvider } from '@app/common/providers/auth';
import { Apt, AptDto } from '@app/common/interfaces/auth';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('apts', 'auth');

@Resolver(() => AptSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AptsResolver extends ControllerClass<Apt, AptDto> implements IController<Apt, AptDto> {
  constructor(readonly provider: AuthProvider) {
    super(provider.apts, AptSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadAuthApts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthApts)
  countAuthApt(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AptDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteAuthApts)
  @Validation('auth/apts', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthApts)
  createAuthApt(@Meta() meta: Metadata, @Args('data') data: CreateAptDto): Observable<AptDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AptItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteAuthApts)
  @Validation('auth/apts', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthApts)
  createAuthAptBulk(@Meta() meta: Metadata, @Args('data') data: CreateAptItemsDto): Observable<AptItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AptItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadAuthApts)
  @SetPolicy(Action.Read, Resource.AuthApts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findAuthApt(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Apt>): Observable<AptItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AptDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadAuthApts)
  @SetPolicy(Action.Read, Resource.AuthApts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findAuthAptById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Apt>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AptDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AptDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteAuthApts)
  @SetPolicy(Action.Delete, Resource.AuthApts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteAuthAptById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Apt>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AptDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AptDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteAuthApts)
  @SetPolicy(Action.Restore, Resource.AuthApts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreAuthAptById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Apt>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AptDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AptDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageAuthApts)
  @SetPolicy(Action.Destroy, Resource.AuthApts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyAuthAptById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Apt>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AptDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }
}
