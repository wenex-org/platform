import { CreateFileDto, CreateFileItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateFileDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, FileDataSerializer, FileItemsSerializer, FileSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, File, FileDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => FileSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class FilesResolver extends ControllerClass<File, FileDto> implements ControllerInterface<File, FileDto> {
  constructor(readonly provider: SpecialProvider) {
    super(provider.files, () => FileSerializer);
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
  createBulkFile(@Meta() meta: Metadata, @Args('data') data: CreateFileItemsDto): Observable<FileItemsSerializer> {
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
  findOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => FileDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('data') update: UpdateFileDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Files, 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkFile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<File>,
    @Args('data') update: UpdateFileDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
