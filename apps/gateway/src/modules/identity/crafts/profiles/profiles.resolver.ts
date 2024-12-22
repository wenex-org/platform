import { ProfileDataSerializer, ProfileItemsSerializer, ProfileSerializer } from '@app/common/serializers/identity';
import { CreateProfileDto, CreateProfileItemsDto, UpdateProfileDto } from '@app/common/dto/identity';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Profile, ProfileDto } from '@app/common/interfaces/identity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
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
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  countProfile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ProfileDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createProfile(@Meta() meta: Metadata, @Args('data') data: CreateProfileDto): Observable<ProfileDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ProfileItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createProfileBulk(@Meta() meta: Metadata, @Args('data') data: CreateProfileItemsDto): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ProfileItemsSerializer)
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findProfile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Profile>): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ProfileDataSerializer)
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @SetPolicy(Action.Delete, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @SetPolicy(Action.Restore, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @SetScope(Scope.ManageIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @SetPolicy(Action.Destroy, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
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
  @ShipStrategy('update')
  @SetScope(Scope.ManageIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
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
  @ShipStrategy('update')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
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
