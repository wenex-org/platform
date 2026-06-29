import { AssessmentDataSerializer, AssessmentItemsSerializer, AssessmentSerializer } from '@app/common/serializers/education';
import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateAssessmentDto, CreateAssessmentItemsDto, UpdateAssessmentDto } from '@app/common/dto/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Assessment, AssessmentDto } from '@app/common/interfaces/education';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
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

const COLL_PATH = COLLECTION('assessments', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class AssessmentsResolver
  extends ControllerClass<Assessment, AssessmentDto>
  implements IController<Assessment, AssessmentDto>
{
  constructor(readonly provider: EducationProvider) {
    super(provider.assessments, AssessmentSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationAssessments)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationAssessments)
  countEducationAssessment(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => AssessmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationAssessments)
  @Validation('education/assessments', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationAssessments)
  createEducationAssessment(@Meta() meta: Metadata, @Args('data') data: CreateAssessmentDto): Observable<AssessmentDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => AssessmentItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationAssessments)
  @Validation('education/assessments', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationAssessments)
  createEducationAssessmentBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateAssessmentItemsDto,
  ): Observable<AssessmentItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => AssessmentItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationAssessments)
  @SetPolicy(Action.Read, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationAssessment(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Assessment>,
  ): Observable<AssessmentItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => AssessmentDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationAssessments)
  @SetPolicy(Action.Read, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationAssessmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Assessment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AssessmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => AssessmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationAssessments)
  @SetPolicy(Action.Delete, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationAssessmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Assessment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AssessmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => AssessmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationAssessments)
  @SetPolicy(Action.Restore, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationAssessmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Assessment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AssessmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => AssessmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationAssessments)
  @SetPolicy(Action.Destroy, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationAssessmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Assessment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AssessmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationAssessments)
  @Validation('education/assessments', 'update')
  @SetPolicy(Action.Update, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationAssessmentBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateAssessmentDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Assessment>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => AssessmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationAssessments)
  @Validation('education/assessments', 'update')
  @SetPolicy(Action.Update, Resource.EducationAssessments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationAssessmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Assessment>,
    @Args('data') update: UpdateAssessmentDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<AssessmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
