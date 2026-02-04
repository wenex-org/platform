import { CommentDataSerializer, CommentItemsSerializer, CommentSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateCommentDto, CreateCommentItemsDto, UpdateCommentDto } from '@app/common/dto/general';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Comment, CommentDto } from '@app/common/interfaces/general';
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

const COLL_PATH = COLLECTION('comments', 'general');

@Resolver(() => CommentSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CommentsResolver extends ControllerClass<Comment, CommentDto> implements IController<Comment, CommentDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.comments, CommentSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  countGeneralComment(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => CommentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @UseInterceptors(...WriteInterceptors)
  @Validation('general/comments', 'create')
  @SetPolicy(Action.Create, Resource.GeneralComments)
  createGeneralComment(@Meta() meta: Metadata, @Args('data') data: CreateCommentDto): Observable<CommentDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => CommentItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @UseInterceptors(...WriteInterceptors)
  @Validation('general/comments', 'create')
  @SetPolicy(Action.Create, Resource.GeneralComments)
  createGeneralCommentBulk(@Meta() meta: Metadata, @Args('data') data: CreateCommentItemsDto): Observable<CommentItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => CommentItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralComment(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Comment>,
  ): Observable<CommentItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => CommentDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findGeneralCommentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Comment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CommentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => CommentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @SetPolicy(Action.Delete, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteGeneralCommentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Comment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CommentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => CommentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @SetPolicy(Action.Restore, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreGeneralCommentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Comment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CommentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => CommentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralComments)
  @SetPolicy(Action.Destroy, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyGeneralCommentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Comment>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CommentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralComments)
  @Validation('general/comments', 'update')
  @SetPolicy(Action.Update, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralCommentBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateCommentDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Comment>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => CommentDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @Validation('general/comments', 'update')
  @SetPolicy(Action.Update, Resource.GeneralComments)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateGeneralCommentById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Comment>,
    @Args('data') update: UpdateCommentDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<CommentDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
