import { TotalSerializer, UserDataSerializer, UserItemsSerializer, UserSerializer } from '@app/common/serializers';
import { CreateUserDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateUserDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, User, UserDto } from '@app/common/interfaces';
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
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
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
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  countUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  @ShipStrategy('create')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createUser(
    @Meta() meta: Metadata,
    @Args('data') data: CreateUserDto,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => UserItemsSerializer)
  @ShipStrategy('create')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityUsers)
  createBulkUser(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateUserDto] }) items: CreateUserDto[],
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => UserItemsSerializer)
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<User>,
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => UserDataSerializer)
  @Cache('users', 'fill')
  @SetScope(Scope.ReadIdentityUsers)
  @SetPolicy(Action.Read, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Delete, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Restore, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  @Cache('users', 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Destroy, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<User>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  @ShipStrategy('update')
  @Cache('users', 'flush')
  @SetScope(Scope.WriteIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<User>,
    @Args('data') update: UpdateUserDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('users', 'flush')
  @SetScope(Scope.ManageIdentityUsers)
  @SetPolicy(Action.Update, Resource.IdentityUsers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<User>,
    @Args('data') update: UpdateUserDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
