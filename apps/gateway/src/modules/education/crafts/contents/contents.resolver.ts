import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { ContentDataSerializer, ContentItemsSerializer, ContentSerializer } from '@app/common/serializers/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateContentDto, CreateContentItemsDto, UpdateContentDto } from '@app/common/dto/education';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Content, ContentDto } from '@app/common/interfaces/education';
import { EducationProvider } from '@app/common/providers/education';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('contents', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ContentsResolver extends ControllerClass<Content, ContentDto> implements IController<Content, ContentDto> {
  constructor(readonly provider: EducationProvider) {
    super(provider.contents, ContentSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationContents)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationContents)
  countEducationContent(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ContentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationContents)
  @Validation('education/contents', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationContents)
  createEducationContent(@Meta() meta: Metadata, @Args('data') data: CreateContentDto): Observable<ContentDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ContentItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationContents)
  @Validation('education/contents', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationContents)
  createEducationContentBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateContentItemsDto,
  ): Observable<ContentItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ContentItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationContents)
  @SetPolicy(Action.Read, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationContent(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Content>,
  ): Observable<ContentItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ContentDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationContents)
  @SetPolicy(Action.Read, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationContentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Content>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ContentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationContents)
  @SetPolicy(Action.Delete, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationContentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Content>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ContentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationContents)
  @SetPolicy(Action.Restore, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationContentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Content>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ContentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationContents)
  @SetPolicy(Action.Destroy, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationContentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Content>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationContents)
  @Validation('education/contents', 'update')
  @SetPolicy(Action.Update, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationContentBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateContentDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Content>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ContentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationContents)
  @Validation('education/contents', 'update')
  @SetPolicy(Action.Update, Resource.EducationContents)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationContentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Content>,
    @Args('data') update: UpdateContentDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
