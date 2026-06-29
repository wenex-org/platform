import { SubmissionDataSerializer, SubmissionItemsSerializer, SubmissionSerializer } from '@app/common/serializers/education';
import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateSubmissionDto, CreateSubmissionItemsDto, UpdateSubmissionDto } from '@app/common/dto/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Submission, SubmissionDto } from '@app/common/interfaces/education';
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

const COLL_PATH = COLLECTION('submissions', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SubmissionsResolver
  extends ControllerClass<Submission, SubmissionDto>
  implements IController<Submission, SubmissionDto>
{
  constructor(readonly provider: EducationProvider) {
    super(provider.submissions, SubmissionSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSubmissions)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationSubmissions)
  countEducationSubmission(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => SubmissionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSubmissions)
  @Validation('education/submissions', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationSubmissions)
  createEducationSubmission(@Meta() meta: Metadata, @Args('data') data: CreateSubmissionDto): Observable<SubmissionDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => SubmissionItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSubmissions)
  @Validation('education/submissions', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationSubmissions)
  createEducationSubmissionBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateSubmissionItemsDto,
  ): Observable<SubmissionItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => SubmissionItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSubmissions)
  @SetPolicy(Action.Read, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationSubmission(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Submission>,
  ): Observable<SubmissionItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => SubmissionDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationSubmissions)
  @SetPolicy(Action.Read, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationSubmissionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Submission>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SubmissionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => SubmissionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSubmissions)
  @SetPolicy(Action.Delete, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationSubmissionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Submission>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SubmissionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => SubmissionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSubmissions)
  @SetPolicy(Action.Restore, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationSubmissionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Submission>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SubmissionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => SubmissionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationSubmissions)
  @SetPolicy(Action.Destroy, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationSubmissionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Submission>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SubmissionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationSubmissions)
  @Validation('education/submissions', 'update')
  @SetPolicy(Action.Update, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationSubmissionBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateSubmissionDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Submission>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => SubmissionDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationSubmissions)
  @Validation('education/submissions', 'update')
  @SetPolicy(Action.Update, Resource.EducationSubmissions)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationSubmissionById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Submission>,
    @Args('data') update: UpdateSubmissionDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<SubmissionDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
