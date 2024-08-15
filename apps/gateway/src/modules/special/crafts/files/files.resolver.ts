import { CreateFileDto, CreateFileItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateFileDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, FileDataSerializer, FileItemsSerializer, FileSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, File, FileDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
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
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  countFile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => FileDataSerializer)
  @ShipStrategy('create')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createFile(
    @Meta() meta: Metadata,
    @Args('data') data: CreateFileDto,
    @Session() session?: ClientSession,
  ): Observable<FileDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => FileItemsSerializer)
  @ShipStrategy('create')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.SpecialFiles)
  createBulkFile(
    @Meta() meta: Metadata,
    @Args('data') data: CreateFileItemsDto,
    @Session() session?: ClientSession,
  ): Observable<FileItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Query(() => FileItemsSerializer)
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findFile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<File>,
    @Session() session?: ClientSession,
  ): Observable<FileItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => FileDataSerializer)
  @Cache('files', 'fill')
  @SetScope(Scope.ReadSpecialFiles)
  @SetPolicy(Action.Read, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => FileDataSerializer)
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Delete, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => FileDataSerializer)
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Restore, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => FileDataSerializer)
  @Cache('files', 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Destroy, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<File>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => FileDataSerializer)
  @ShipStrategy('update')
  @Cache('files', 'flush')
  @SetScope(Scope.WriteSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneFile(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<File>,
    @Args('data') update: UpdateFileDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<FileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('files', 'flush')
  @SetScope(Scope.ManageSpecialFiles)
  @SetPolicy(Action.Update, Resource.SpecialFiles)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkFile(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<File>,
    @Args('data') update: UpdateFileDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
