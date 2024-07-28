import { TotalSerializer, ArtifactDataSerializer, ArtifactItemsSerializer, ArtifactSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { CreateArtifactDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateArtifactDto } from '@app/common/dto';
import { Controller as ControllerInterface, Metadata, Artifact, ArtifactDto } from '@app/common/interfaces';
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
import { GeneralProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => ArtifactSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ArtifactsResolver
  extends ControllerClass<Artifact, ArtifactDto>
  implements ControllerInterface<Artifact, ArtifactDto>
{
  constructor(readonly provider: GeneralProvider) {
    super(provider.artifacts, () => ArtifactSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  countArtifact(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => ArtifactDataSerializer)
  @ShipStrategy('create')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  createArtifact(
    @Meta() meta: Metadata,
    @Args('data') data: CreateArtifactDto,
    @Session() session?: ClientSession,
  ): Observable<ArtifactDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => ArtifactItemsSerializer)
  @ShipStrategy('create')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  createBulkArtifact(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateArtifactDto] }) items: CreateArtifactDto[],
    @Session() session?: ClientSession,
  ): Observable<ArtifactItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => ArtifactItemsSerializer)
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findArtifact(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
  ): Observable<ArtifactItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => ArtifactDataSerializer)
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneArtifact(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Delete, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneArtifact(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Restore, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneArtifact(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => ArtifactDataSerializer)
  @Cache('artifacts', 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Destroy, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneArtifact(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => ArtifactDataSerializer)
  @ShipStrategy('update')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneArtifact(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Args('data') update: UpdateArtifactDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkArtifact(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Artifact>,
    @Args('data') update: UpdateArtifactDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
