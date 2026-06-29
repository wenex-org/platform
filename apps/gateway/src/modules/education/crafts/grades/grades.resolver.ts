import { Audit, Cache, CollectionPath, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { GradeDataSerializer, GradeItemsSerializer, GradeSerializer } from '@app/common/serializers/education';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateGradeDto, CreateGradeItemsDto, UpdateGradeDto } from '@app/common/dto/education';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { EducationProvider } from '@app/common/providers/education';
import { Grade, GradeDto } from '@app/common/interfaces/education';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('grades', 'education');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@CollectionPath(COLL_PATH)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GradesResolver extends ControllerClass<Grade, GradeDto> implements IController<Grade, GradeDto> {
  constructor(readonly provider: EducationProvider) {
    super(provider.grades, GradeSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationGrades)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.EducationGrades)
  countEducationGrade(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => GradeDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationGrades)
  @Validation('education/grades', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationGrades)
  createEducationGrade(@Meta() meta: Metadata, @Args('data') data: CreateGradeDto): Observable<GradeDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => GradeItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationGrades)
  @Validation('education/grades', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.EducationGrades)
  createEducationGradeBulk(@Meta() meta: Metadata, @Args('data') data: CreateGradeItemsDto): Observable<GradeItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => GradeItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationGrades)
  @SetPolicy(Action.Read, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationGrade(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Grade>): Observable<GradeItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => GradeDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadEducationGrades)
  @SetPolicy(Action.Read, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findEducationGradeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grade>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GradeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => GradeDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationGrades)
  @SetPolicy(Action.Delete, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteEducationGradeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grade>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GradeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => GradeDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationGrades)
  @SetPolicy(Action.Restore, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreEducationGradeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grade>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GradeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => GradeDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationGrades)
  @SetPolicy(Action.Destroy, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyEducationGradeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grade>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GradeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageEducationGrades)
  @Validation('education/grades', 'update')
  @SetPolicy(Action.Update, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationGradeBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateGradeDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Grade>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => GradeDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteEducationGrades)
  @Validation('education/grades', 'update')
  @SetPolicy(Action.Update, Resource.EducationGrades)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEducationGradeById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grade>,
    @Args('data') update: UpdateGradeDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<GradeDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
