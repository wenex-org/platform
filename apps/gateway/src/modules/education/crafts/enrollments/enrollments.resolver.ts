import { EnrollmentDataSerializer, EnrollmentItemsSerializer, EnrollmentSerializer } from '@app/common/serializers/education';
import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateEnrollmentDto, CreateEnrollmentItemsDto, UpdateEnrollmentDto } from '@app/common/dto/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Enrollment, EnrollmentDto } from '@app/common/interfaces/education';
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

const COLL_PATH = COLLECTION('enrollments', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EnrollmentsResolver
  extends ControllerClass<Enrollment, EnrollmentDto>
  implements IController<Enrollment, EnrollmentDto>
{
  constructor(readonly provider: EducationProvider) {
    super(provider.enrollments, EnrollmentSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationEnrollments)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationEnrollments)
  countEducationEnrollment(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => EnrollmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationEnrollments)
  @Validation('education/enrollments', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationEnrollments)
  createEducationEnrollment(@Meta() meta: Metadata, @Args('data') data: CreateEnrollmentDto): Observable<EnrollmentDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => EnrollmentItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationEnrollments)
  @Validation('education/enrollments', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationEnrollments)
  createEducationEnrollmentBulk(
    @Meta() meta: Metadata,
    @Args('data') data: CreateEnrollmentItemsDto,
  ): Observable<EnrollmentItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => EnrollmentItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationEnrollments)
  @SetPolicy(Action.Read, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationEnrollment(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Enrollment>,
  ): Observable<EnrollmentItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => EnrollmentDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationEnrollments)
  @SetPolicy(Action.Read, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationEnrollmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Enrollment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EnrollmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => EnrollmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationEnrollments)
  @SetPolicy(Action.Delete, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationEnrollmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Enrollment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EnrollmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => EnrollmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationEnrollments)
  @SetPolicy(Action.Restore, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationEnrollmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Enrollment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EnrollmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => EnrollmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationEnrollments)
  @SetPolicy(Action.Destroy, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationEnrollmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Enrollment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EnrollmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationEnrollments)
  @Validation('education/enrollments', 'update')
  @SetPolicy(Action.Update, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationEnrollmentBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateEnrollmentDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Enrollment>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => EnrollmentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationEnrollments)
  @Validation('education/enrollments', 'update')
  @SetPolicy(Action.Update, Resource.EducationEnrollments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationEnrollmentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Enrollment>,
    @Args('data') update: UpdateEnrollmentDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EnrollmentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
