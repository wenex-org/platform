import {
  TotalSerializer,
  UserDataSerializer,
  UserItemsSerializer,
  UserSerializer,
} from '@app/common/serializers';
import {
  CreateUserDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateUserDto,
} from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Metadata, UserDom, UserSer } from '@app/common/interfaces';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => UserSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class UsersResolver extends GrpcController<UserDom, UserSer> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.users, () => UserSerializer);
  }

  @Query(() => TotalSerializer)
  countUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  createUser(
    @Meta() meta: Metadata,
    @Args('data') data: CreateUserDto,
    @Session() session?: ClientSession,
  ): Observable<UserDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => UserItemsSerializer)
  createBulkUser(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateUserDto] }) items: CreateUserDto[],
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => UserItemsSerializer)
  findUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
  ): Observable<UserItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => UserDataSerializer)
  findOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<UserDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  deleteOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  restoreOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  destroyOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<UserDom>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => UserDataSerializer)
  updateOneUser(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<UserDom>,
    @Args('data') update: UpdateUserDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<UserDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  updateBulkUser(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<UserDom>,
    @Args('data') update: UpdateUserDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
