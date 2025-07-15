import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { PostDataSerializer, PostItemsSerializer, PostSerializer } from '@app/common/serializers/content';
import { CreatePostDto, CreatePostItemsDto, UpdatePostDto } from '@app/common/dto/content';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ContentProvider } from '@app/common/providers/content';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { Post, PostDto } from '@app/common/interfaces/content';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('posts', 'content');

@Resolver(() => PostSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class PostsResolver extends ControllerClass<Post, PostDto> implements IController<Post, PostDto> {
  constructor(readonly provider: ContentProvider) {
    super(provider.posts, PostSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentPosts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContentPosts)
  countContentPost(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => PostDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentPosts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentPosts)
  createContentPost(@Meta() meta: Metadata, @Args('data') data: CreatePostDto): Observable<PostDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => PostItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentPosts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentPosts)
  createContentPostBulk(@Meta() meta: Metadata, @Args('data') data: CreatePostItemsDto): Observable<PostItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => PostItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentPosts)
  @SetPolicy(Action.Read, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContentPost(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Post>): Observable<PostItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => PostDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentPosts)
  @SetPolicy(Action.Read, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContentPostById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Post>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PostDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => PostDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentPosts)
  @SetPolicy(Action.Delete, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteContentPostById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Post>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PostDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => PostDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentPosts)
  @SetPolicy(Action.Restore, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreContentPostById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Post>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PostDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => PostDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentPosts)
  @SetPolicy(Action.Destroy, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyContentPostById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Post>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PostDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentPosts)
  @SetPolicy(Action.Update, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContentPostBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdatePostDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Post>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => PostDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentPosts)
  @SetPolicy(Action.Update, Resource.ContentPosts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContentPostById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Post>,
    @Args('data') update: UpdatePostDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<PostDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
