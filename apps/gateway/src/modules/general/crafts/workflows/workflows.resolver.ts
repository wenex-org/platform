import {
  CreateWorkflowDto,
  CreateWorkflowItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateWorkflowDto,
} from '@app/common/dto';
import { TotalSerializer, WorkflowDataSerializer, WorkflowItemsSerializer, WorkflowSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Workflow, WorkflowDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { GeneralProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => WorkflowSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class WorkflowsResolver
  extends ControllerClass<Workflow, WorkflowDto>
  implements ControllerInterface<Workflow, WorkflowDto>
{
  constructor(readonly provider: GeneralProvider) {
    super(provider.workflows, () => WorkflowSerializer);
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
  @ShipStrategy('create')
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralWorkflows)
  createWorkflow(@Meta() meta: Metadata, @Args('data') data: CreateWorkflowDto): Observable<WorkflowDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => WorkflowItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralWorkflows)
  createBulkWorkflow(@Meta() meta: Metadata, @Args('data') data: CreateWorkflowItemsDto): Observable<WorkflowItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => WorkflowItemsSerializer)
  @Cache(Collection.Workflows, 'fill')
  @SetScope(Scope.ReadGeneralWorkflows)
  @SetPolicy(Action.Read, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findWorkflow(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Workflow>): Observable<WorkflowItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'fill')
  @SetScope(Scope.ReadGeneralWorkflows)
  @SetPolicy(Action.Read, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneWorkflow(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Workflow>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Delete, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneWorkflow(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Restore, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneWorkflow(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.ManageGeneralWorkflows)
  @SetPolicy(Action.Destroy, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneWorkflow(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Workflow>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => WorkflowDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.WriteGeneralWorkflows)
  @SetPolicy(Action.Update, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneWorkflow(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Workflow>,
    @Args('data') update: UpdateWorkflowDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<WorkflowDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Workflows, 'flush')
  @SetScope(Scope.ManageGeneralWorkflows)
  @SetPolicy(Action.Update, Resource.GeneralWorkflows)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkWorkflow(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Workflow>,
    @Args('data') update: UpdateWorkflowDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
