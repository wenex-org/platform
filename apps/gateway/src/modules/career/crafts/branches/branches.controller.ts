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
import { BranchDataSerializer, BranchItemsSerializer, BranchSerializer } from '@app/common/serializers/career';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateBranchDto, CreateBranchItemsDto, UpdateBranchDto } from '@app/common/dto/career';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Branch, BranchDto } from '@app/common/interfaces/career';
import { Filter, Meta, Perm } from '@app/common/core/decorators';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { CareerProvider } from '@app/common/providers/career';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Observable, switchMap } from 'rxjs';
import { Permission } from 'abacl';
import { Response } from 'express';

const COLL_PATH = COLLECTION('branches', 'career');

@ApiBearerAuth()
@RateLimit(COLL_PATH)
@Controller(COLL_PATH)
@UsePipes(ValidationPipe)
@ApiTags('career', 'branches')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class BranchesController extends ControllerClass<Branch, BranchDto> implements IController<Branch, BranchDto> {
  constructor(readonly provider: CareerProvider) {
    super(provider.branches, BranchSerializer);
  }

  @Get('count')
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBranches)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Create, Resource.CareerBranches)
  override create(@Meta() meta: Metadata, @Body() data: CreateBranchDto): Observable<BranchDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: BranchItemsSerializer })
  @SetPolicy(Action.Create, Resource.CareerBranches)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateBranchItemsDto): Observable<BranchItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadCareerBranches)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @ApiResponse({ type: BranchItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Branch>): Observable<BranchItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadCareerBranches)
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  @ApiResponse({ status: HttpStatus.OK, type: BranchSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Perm() perm: Permission, @Filter() filter: FilterOneDto<Branch>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Career-Type', 'text/event-stream');
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
  @SetScope(Scope.ReadCareerBranches)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Read, Resource.CareerBranches)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Branch>): Observable<BranchDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Delete, Resource.CareerBranches)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Branch>): Observable<BranchDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Restore, Resource.CareerBranches)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Branch>): Observable<BranchDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBranches)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Destroy, Resource.CareerBranches)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Branch>): Observable<BranchDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageCareerBranches)
  @SetPolicy(Action.Update, Resource.CareerBranches)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Branch>,
    @Body() update: UpdateBranchDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteCareerBranches)
  @ApiResponse({ type: BranchDataSerializer })
  @SetPolicy(Action.Update, Resource.CareerBranches)
  @ApiParam({ type: String, name: 'id', required: true })
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Branch>,
    @Body() update: UpdateBranchDto,
  ): Observable<BranchDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}
