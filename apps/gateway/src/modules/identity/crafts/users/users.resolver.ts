import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { UserDataSerializer, UserItemsSerializer, UserSerializer } from '@app/common/serializers/identity';
import { CreateUserDto, CreateUserItemsDto, UpdateUserDto } from '@app/common/dto/identity';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
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

@Resolver(() => UserSerializer)
@RateLimit('users')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class UsersResolver extends ControllerClass<User, UserDto> implements IController<User, UserDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, UserSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Users, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  countUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUser(@Meta() meta: Metadata, @Args('data') data: CreateUserDto): Observable<UserDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => UserItemsSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUserBulk(@Meta() meta: Metadata, @Args('data') data: CreateUserItemsDto): Observable<UserItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => UserItemsSerializer)
  @Cache(Collection.Users, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<User>): Observable<UserItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => UserDataSerializer)
  @Cache(Collection.Users, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyUserById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<UserDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateUserBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateUserDto,
    @Filter() @Args('filter') filter: QueryFilterDto<User>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateUserById(
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
