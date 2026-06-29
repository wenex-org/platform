import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { SectionDataSerializer, SectionItemsSerializer, SectionSerializer } from '@app/common/serializers/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateSectionDto, CreateSectionItemsDto, UpdateSectionDto } from '@app/common/dto/education';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Section, SectionDto } from '@app/common/interfaces/education';
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

const COLL_PATH = COLLECTION('sections', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SectionsResolver extends ControllerClass<Section, SectionDto> implements IController<Section, SectionDto> {
  constructor(readonly provider: EducationProvider) {
    super(provider.sections, SectionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSections)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationSections)
  countEducationSection(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SectionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSections)
  @Validation('education/sections', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationSections)
  createEducationSection(@Meta() meta: Metadata, @Args('data') data: CreateSectionDto): Observable<SectionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SectionItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSections)
  @Validation('education/sections', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationSections)
  createEducationSectionBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateSectionItemsDto,
  ): Observable<SectionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SectionItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSections)
  @SetPolicy(Action.Read, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationSection(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Section>,
  ): Observable<SectionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SectionDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSections)
  @SetPolicy(Action.Read, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationSectionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Section>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SectionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SectionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSections)
  @SetPolicy(Action.Delete, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationSectionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Section>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SectionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SectionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSections)
  @SetPolicy(Action.Restore, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationSectionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Section>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SectionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SectionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationSections)
  @SetPolicy(Action.Destroy, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationSectionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Section>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SectionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationSections)
  @Validation('education/sections', 'update')
  @SetPolicy(Action.Update, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationSectionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSectionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Section>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SectionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSections)
  @Validation('education/sections', 'update')
  @SetPolicy(Action.Update, Resource.EducationSections)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationSectionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Section>,
    @Args('data') update: UpdateSectionDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SectionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
