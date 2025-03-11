import { WorkflowDataSerializer, WorkflowItemsSerializer, WorkflowSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateWorkflowDto, CreateWorkflowItemsDto, UpdateWorkflowDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { Workflow, WorkflowDto } from '@app/common/interfaces/general';
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

@Resolver(() => WorkflowSerializer)
@RateLimit('workflows')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WorkflowsResolver extends ControllerClass<Workflow, WorkflowDto> implements IController<Workflow, WorkflowDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.workflows, WorkflowSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Workflows, 'fill')
  @SetScope(Scope.ReadGeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralWorkflows)
  countWorkflow(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralWorkflows)
  createWorkflow(@Meta() meta: Metadata, @Args('data') data: CreateWorkflowDto): Observable<WorkflowDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => WorkflowItemsSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralWorkflows)
  createWorkflowBulk(@Meta() meta: Metadata, @Args('data') data: CreateWorkflowItemsDto): Observable<WorkflowItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => WorkflowItemsSerializer)
  @Cache(Collection.Workflows, 'fill')
  @SetScope(Scope.ReadGeneralWorkflows)
  @SetPolicy(Action.Read, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findWorkflow(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Workflow>): Observable<WorkflowItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'fill')
  @SetScope(Scope.ReadGeneralWorkflows)
  @SetPolicy(Action.Read, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findWorkflowById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Workflow>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Delete, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteWorkflowById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Restore, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreWorkflowById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.ManageGeneralWorkflows)
  @SetPolicy(Action.Destroy, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyWorkflowById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.ManageGeneralWorkflows)
  @SetPolicy(Action.Update, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateWorkflowBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateWorkflowDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Workflow>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Update, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateWorkflowById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Workflow>,
    @Args('data') update: UpdateWorkflowDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
