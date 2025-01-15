import { FileDataSerializer, FileItemsSerializer, FileSerializer } from '@app/common/serializers/special';
import { UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateFileDto, CreateFileItemsDto, UpdateFileDto } from '@app/common/dto/special';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { SpecialProvider } from '@app/common/providers/special';
import { File, FileDto } from '@app/common/interfaces/special';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => FileSerializer)
@RateLimit('files')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesResolver extends ControllerClass<File, FileDto> implements IController<File, FileDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.files, FileSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  countFile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createFile(@Meta() meta: Metadata, @Args('data') data: CreateFileDto): Observable<FileDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => FileItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createFileBulk(@Meta() meta: Metadata, @Args('data') data: CreateFileItemsDto): Observable<FileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => FileItemsSerializer)
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findFile(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<File>): Observable<FileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => FileDataSerializer)
  @Cache(Collection.Files, 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyFileById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<FileDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFileBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateFileDto,
    @Filter() @Args('filter') filter: QueryFilterDto<File>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => FileDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateFileById(
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
