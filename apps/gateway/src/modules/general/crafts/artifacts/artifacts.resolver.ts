import { ArtifactDataSerializer, ArtifactItemsSerializer, ArtifactSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateArtifactDto, CreateArtifactItemsDto, UpdateArtifactDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Artifact, ArtifactDto } from '@app/common/interfaces/general';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('artifacts', 'general');

@Resolver(() => ArtifactSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ArtifactsResolver extends ControllerClass<Artifact, ArtifactDto> implements IController<Artifact, ArtifactDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.artifacts, ArtifactSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  countArtifact(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  createArtifact(@Meta() meta: Metadata, @Args('data') data: CreateArtifactDto): Observable<ArtifactDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ArtifactItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  createArtifactBulk(@Meta() meta: Metadata, @Args('data') data: CreateArtifactItemsDto): Observable<ArtifactItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ArtifactItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findArtifact(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Artifact>): Observable<ArtifactItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findArtifactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Delete, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteArtifactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Restore, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreArtifactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Destroy, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyArtifactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateArtifactBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateArtifactDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Artifact>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateArtifactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Args('data') update: UpdateArtifactDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
