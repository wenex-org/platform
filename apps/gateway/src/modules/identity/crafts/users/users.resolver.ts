import { UserDataSerializer, UserItemsSerializer, UserSerializer } from '@app/common/serializers/identity';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateUserDto, CreateUserItemsDto, UpdateUserDto } from '@app/common/dto/identity';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { User, UserDto } from '@app/common/interfaces/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
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
  @SetScope(Scope.ReadIdentityUsers)
  @Cache(Collection.Users, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  countUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityUsers)
  @Cache(Collection.Users, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUser(@Meta() meta: Metadata, @Args('data') data: CreateUserDto): Observable<UserDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => UserItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityUsers)
  @Cache(Collection.Users, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUserBulk(@Meta() meta: Metadata, @Args('data') data: CreateUserItemsDto): Observable<UserItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => UserItemsSerializer)
  @SetScope(Scope.ReadIdentityUsers)
  @Cache(Collection.Users, 'fill')
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<User>): Observable<UserItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => UserDataSerializer)
  @SetScope(Scope.ReadIdentityUsers)
  @Cache(Collection.Users, 'fill')
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentityUsers)
  @Cache(Collection.Users, 'flush')
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentityUsers)
  @Cache(Collection.Users, 'flush')
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.ManageIdentityUsers)
  @Cache(Collection.Users, 'flush')
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @ShipStrategy('update')
  @SetScope(Scope.ManageIdentityUsers)
  @Cache(Collection.Users, 'flush')
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
  @ShipStrategy('update')
  @SetScope(Scope.WriteIdentityUsers)
  @Cache(Collection.Users, 'flush')
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
