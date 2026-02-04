import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CommentDataSerializer, CommentItemsSerializer, CommentSerializer } from '@app/common/serializers/general';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateCommentDto, CreateCommentItemsDto, UpdateCommentDto } from '@app/common/dto/general';
import { AuthorityInterceptor, ProjectionInterceptor } from '@app/common/core/interceptors/mongo';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Comment, CommentDto } from '@app/common/interfaces/general';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { GeneralProvider } from '@app/common/providers/general';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('comments', 'general');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('general', 'comments')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class CommentsController extends ControllerClass<Comment, CommentDto> implements IController<Comment, CommentDto> {
  constructor(readonly provider: GeneralProvider) {
    super(provider.comments, CommentSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @UseInterceptors(...WriteInterceptors)
  @Validation('general/comments', 'create')
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Create, Resource.GeneralComments)
  override create(@Meta() meta: Metadata, @Body() data: CreateCommentDto): Observable<CommentDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @UseInterceptors(...WriteInterceptors)
  @Validation('general/comments', 'create')
  @ApiResponse({ type: CommentItemsSerializer })
  @SetPolicy(Action.Create, Resource.GeneralComments)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateCommentItemsDto): Observable<CommentItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @ApiResponse({ type: CommentItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Comment>): Observable<CommentItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadGeneralComments)
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: CommentSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Comment>) {
    // Server Sent-Comment Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super
      .cursor(meta, filter)
      .pipe(switchMap((value) => perm.filter(value)))
      .subscribe({
        next: (data) => res.write(getSseMessage({ id: data.id, data })),
        error: (data) => res.end(getSseMessage({ event: 'error', data })),
        complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
      });
  }

  @Get(':id')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadGeneralComments)
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Read, Resource.GeneralComments)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Comment>): Observable<CommentDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Delete, Resource.GeneralComments)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Comment>): Observable<CommentDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Restore, Resource.GeneralComments)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Comment>): Observable<CommentDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralComments)
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Destroy, Resource.GeneralComments)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Comment>): Observable<CommentDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageGeneralComments)
  @Validation('general/comments', 'update')
  @SetPolicy(Action.Update, Resource.GeneralComments)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Comment>,
    @Body() update: UpdateCommentDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteGeneralComments)
  @Validation('general/comments', 'update')
  @ApiResponse({ type: CommentDataSerializer })
  @SetPolicy(Action.Update, Resource.GeneralComments)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ProjectionInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Comment>,
    @Body() update: UpdateCommentDto,
  ): Observable<CommentDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
