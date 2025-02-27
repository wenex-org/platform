import { ProfileDataSerializer, ProfileItemsSerializer, ProfileSerializer } from '@app/common/serializers/identity';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateProfileDto, CreateProfileItemsDto, UpdateProfileDto } from '@app/common/dto/identity';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Profile, ProfileDto } from '@app/common/interfaces/identity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => ProfileSerializer)
@RateLimit('profiles')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProfilesResolver extends ControllerClass<Profile, ProfileDto> implements IController<Profile, ProfileDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, ProfileSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  countProfile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createProfile(@Meta() meta: Metadata, @Args('data') data: CreateProfileDto): Observable<ProfileDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ProfileItemsSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createProfileBulk(@Meta() meta: Metadata, @Args('data') data: CreateProfileItemsDto): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ProfileItemsSerializer)
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findProfile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Profile>): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findProfileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Delete, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteProfileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Restore, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreProfileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Destroy, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyProfileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateProfileBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateProfileDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Profile>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ProfileDataSerializer)
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateProfileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Args('data') update: UpdateProfileDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
