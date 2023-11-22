import {
  TotalSerializer,
  ProfileDataSerializer,
  ProfileItemsSerializer,
  ProfileSerializer,
} from '@app/common/serializers';
import {
  CreateProfileDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateProfileDto,
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
  Profile,
  ProfileDto,
} from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Cache, SetPolicy, SetScope } from '@app/common/metadatas';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => ProfileSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProfilesResolver
  extends ControllerClass<Profile, ProfileDto>
  implements ControllerInterface<Profile, ProfileDto>
{
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, () => ProfileSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('profiles', 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  countProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createProfile(
    @Meta() meta: Metadata,
    @Args('data') data: CreateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<ProfileDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => ProfileItemsSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createBulkProfile(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateProfileDto] }) items: CreateProfileDto[],
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => ProfileItemsSerializer)
  @Cache('profiles', 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Profile>,
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => ProfileDataSerializer)
  @Cache('profiles', 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneProfile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Delete, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneProfile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Restore, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneProfile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Destroy, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneProfile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneProfile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Args('data') update: UpdateProfileDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @Cache('profiles', 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Profile>,
    @Args('data') update: UpdateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
