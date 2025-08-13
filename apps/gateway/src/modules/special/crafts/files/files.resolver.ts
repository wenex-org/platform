import { GatewayInterceptors, WriteInterceptors, ResponseInterceptors } from '@app/common/core/interceptors';
import { FileDataSerializer, FileItemsSerializer, FileSerializer } from '@app/common/serializers/special';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateFileDto, CreateFileItemsDto, UpdateFileDto } from '@app/common/dto/special';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { SpecialProvider } from '@app/common/providers/special';
import { File, FileDto } from '@app/common/interfaces/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('files', 'special');

@Resolver(() => FileSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesResolver extends ControllerClass<File, FileDto> implements IController<File, FileDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.files, FileSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  countSpecialFile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @Validation('special/files', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createSpecialFile(@Meta() meta: Metadata, @Args('data') data: CreateFileDto): Observable<FileDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => FileItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @Validation('special/files', 'create')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createSpecialFileBulk(@Meta() meta: Metadata, @Args('data') data: CreateFileItemsDto): Observable<FileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => FileItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSpecialFile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<File>): Observable<FileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => FileDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findSpecialFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteSpecialFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreSpecialFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroySpecialFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @Validation('special/files', 'update')
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSpecialFileBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateFileDto,
    @Filter() @Args('filter') filter: QueryFilterDto<File>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => FileDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @Validation('special/files', 'update')
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateSpecialFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('data') update: UpdateFileDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
