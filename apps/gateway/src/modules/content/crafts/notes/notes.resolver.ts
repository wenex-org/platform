import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { NoteDataSerializer, NoteItemsSerializer, NoteSerializer } from '@app/common/serializers/content';
import { CreateNoteDto, CreateNoteItemsDto, UpdateNoteDto } from '@app/common/dto/content';
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
import { Note, NoteDto } from '@app/common/interfaces/content';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('notes', 'content');

@Resolver(() => NoteSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class NotesResolver extends ControllerClass<Note, NoteDto> implements IController<Note, NoteDto> {
  constructor(readonly provider: ContentProvider) {
    super(provider.notes, NoteSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentNotes)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ContentNotes)
  countNote(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentNotes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentNotes)
  createNote(@Meta() meta: Metadata, @Args('data') data: CreateNoteDto): Observable<NoteDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => NoteItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentNotes)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ContentNotes)
  createNoteBulk(@Meta() meta: Metadata, @Args('data') data: CreateNoteItemsDto): Observable<NoteItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => NoteItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentNotes)
  @SetPolicy(Action.Read, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findNote(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Note>): Observable<NoteItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadContentNotes)
  @SetPolicy(Action.Read, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findNoteById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Note>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoteDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentNotes)
  @SetPolicy(Action.Delete, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteNoteById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Note>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoteDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentNotes)
  @SetPolicy(Action.Restore, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreNoteById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Note>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoteDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentNotes)
  @SetPolicy(Action.Destroy, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyNoteById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Note>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoteDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageContentNotes)
  @SetPolicy(Action.Update, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateNoteBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateNoteDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Note>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => NoteDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteContentNotes)
  @SetPolicy(Action.Update, Resource.ContentNotes)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateNoteById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Note>,
    @Args('data') update: UpdateNoteDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<NoteDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
