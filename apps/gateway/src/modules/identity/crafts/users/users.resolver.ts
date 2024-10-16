import { CreateUserDto, CreateUserItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateUserDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, UserDataSerializer, UserItemsSerializer, UserSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, User, UserDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => UserSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class UsersResolver extends ControllerClass<User, UserDto> implements ControllerInterface<User, UserDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, () => UserSerializer);
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
  @ShipStrategy('create')
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUser(@Meta() meta: Metadata, @Args('data') data: CreateUserDto): Observable<UserDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => UserItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createBulkUser(@Meta() meta: Metadata, @Args('data') data: CreateUserItemsDto): Observable<UserItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => UserItemsSerializer)
  @Cache(Collection.Users, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findUser(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<User>): Observable<UserItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => UserDataSerializer)
  @Cache(Collection.Users, 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => UserDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('data') update: UpdateUserDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Users, 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<User>,
    @Args('data') update: UpdateUserDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
