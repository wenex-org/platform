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
import {
  CreateArtifactDto,
  CreateArtifactItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateArtifactDto,
} from '@app/common/dto';
import { TotalSerializer, ArtifactDataSerializer, ArtifactItemsSerializer, ArtifactSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Artifact, ArtifactDto } from '@app/common/interfaces';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { GeneralProvider } from '@app/common/providers';
import { ClientSession } from 'mongoose';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('artifacts')
@Controller('artifacts')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ArtifactsController
  extends ControllerClass<Artifact, ArtifactDto>
  implements ControllerInterface<Artifact, ArtifactDto>
{
  constructor(readonly provider: GeneralProvider) {
    super(provider.artifacts, () => ArtifactSerializer);
  }

  @Get('count')
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto, @Session() session?: ClientSession): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Post()
  @ShipStrategy('create')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  create(
    @Meta() meta: Metadata,
    @Body() data: CreateArtifactDto,
    @Session() session?: ClientSession,
  ): Observable<ArtifactDataSerializer> {
    return super.create(meta, data, session);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.GeneralArtifacts)
  createBulk(
    @Meta() meta: Metadata,
    @Body() data: CreateArtifactItemsDto,
    @Session() session?: ClientSession,
  ): Observable<ArtifactItemsSerializer> {
    return super.createBulk(meta, data, session);
  }

  @Get()
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
  ): Observable<ArtifactItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Get('cursor')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ArtifactSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Artifact>) {
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
  @Cache('artifacts', 'fill')
  @SetScope(Scope.ReadGeneralArtifacts)
  @SetPolicy(Action.Read, Resource.GeneralArtifacts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Delete(':id')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Delete, Resource.GeneralArtifacts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Put(':id/restore')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Restore, Resource.GeneralArtifacts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Delete(':id/destroy')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Destroy, Resource.GeneralArtifacts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Artifact>,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.WriteGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Artifact>,
    @Body() update: UpdateArtifactDto,
    @Session() session?: ClientSession,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ArtifactDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache('artifacts', 'flush')
  @SetScope(Scope.ManageGeneralArtifacts)
  @SetPolicy(Action.Update, Resource.GeneralArtifacts)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Artifact>,
    @Body() update: UpdateArtifactDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
