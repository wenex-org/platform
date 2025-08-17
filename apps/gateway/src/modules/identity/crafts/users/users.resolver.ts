import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { UserDataSerializer, UserItemsSerializer, UserSerializer } from '@app/common/serializers/identity';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateUserDto, CreateUserItemsDto, UpdateUserDto } from '@app/common/dto/identity';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { User, UserDto } from '@app/common/interfaces/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('users', 'identity');

@Resolver(() => UserSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class UsersResolver extends ControllerClass<User, UserDto> implements IController<User, UserDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, UserSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  countIdentityUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('identity/users', 'create')
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createIdentityUser(@Meta() meta: Metadata, @Args('data') data: CreateUserDto): Observable<UserDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => UserItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('identity/users', 'create')
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createIdentityUserBulk(@Meta() meta: Metadata, @Args('data') data: CreateUserItemsDto): Observable<UserItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => UserItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findIdentityUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<User>): Observable<UserItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => UserDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findIdentityUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteIdentityUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreIdentityUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyIdentityUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @Validation('identity/users', 'update')
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateIdentityUserBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateUserDto,
    @Filter() @Args('filter') filter: QueryFilterDto<User>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => UserDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @Validation('identity/users', 'update')
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateIdentityUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('data') update: UpdateUserDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
