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
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { Metadata, Profile } from '@app/common/interfaces';
import { refineFilterQuery } from '@app/common/utils';
import { GrpcController } from '@app/common/classes';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => ProfileSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(new SentryInterceptor())
export class ProfilesResolver extends GrpcController<Profile> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, () => ProfileSerializer);
  }

  @Query(() => TotalSerializer)
  countProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => ProfileDataSerializer)
  createProfile(
    @Meta() meta: Metadata,
    @Args('data') data: CreateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<ProfileDataSerializer> {
    return super.create(meta, data as Profile, session);
  }

  @Mutation(() => ProfileItemsSerializer)
  createBulkProfile(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateProfileDto] }) items: CreateProfileDto[],
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, items as Profile[], session);
  }

  @Query(() => ProfileItemsSerializer)
  findProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Profile>,
    @Session() session?: ClientSession,
  ): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => ProfileDataSerializer)
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
  updateBulkProfile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Profile>,
    @Args('data') update: UpdateProfileDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
