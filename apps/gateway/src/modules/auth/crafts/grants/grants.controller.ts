import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { Cache, RateLimit, SetScope } from '@app/common/core/metadatas';
import { GatewayInterceptors } from '@app/common/core/interceptors';
import { AuthGuard, ScopeGuard } from '@app/common/core/guards';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { GrantSerializer } from '@app/common/serializers/auth';
import { Grant, GrantDto } from '@app/common/interfaces/auth';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AuthProvider } from '@app/common/providers/auth';
import { ValidationPipe } from '@app/common/core/pipes';
import { Collection, Scope } from '@app/common/core';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('grants')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Grants)
@Controller(Collection.Grants)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard) // TODO: PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class GrantsController extends ControllerClass<Grant, GrantDto> implements IController<Grant, GrantDto> {
  constructor(readonly provider: AuthProvider) {
    super(provider.grants, GrantSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  create(@Meta() meta: Metadata, @Body() data: CreateGrantDto): Observable<GrantDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.AuthGrants)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateGrantItemsDto): Observable<GrantItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Grant>): Observable<GrantItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadAuthGrants)
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: GrantSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Grant>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getMessageEvent({ id: data.id, data })),
      error: (data) => res.end(getMessageEvent({ event: 'error', data })),
      complete: () => res.end(getMessageEvent({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @SetScope(Scope.ReadAuthGrants)
  @Cache(Collection.Grants, 'fill')
  @SetPolicy(Action.Read, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Delete, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Restore, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Destroy, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Grant>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Grant>,
    @Body() update: UpdateGrantDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteAuthGrants)
  @Cache(Collection.Grants, 'flush')
  @SetPolicy(Action.Update, Resource.AuthGrants)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Grant>,
    @Body() update: UpdateGrantDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<GrantDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
