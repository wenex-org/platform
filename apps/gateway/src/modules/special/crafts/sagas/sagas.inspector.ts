import { Body, Controller, Param, Patch, Post, Query, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { SagaDataSerializer, SagaHistoryDataSerializer } from '@app/common/serializers';
import { AppendSagaHistoryDto, FilterOneDto, StartSagaDto } from '@app/common/dto';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { mapInstanceTo, refineFilterQuery } from '@app/common/utils';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { SpecialProvider } from '@app/common/providers';
import { Metadata, Saga } from '@app/common/interfaces';
import { Filter, Meta } from '@app/common/decorators';
import { from, Observable } from 'rxjs';

@ApiBearerAuth()
@ApiTags('sagas')
@Controller('sagas')
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class SagasInspector {
  constructor(readonly provider: SpecialProvider) {}

  @Post('start')
  @ShipStrategy('create')
  @SetScope(Scope.StartSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Start, Resource.SpecialSagas)
  start(@Meta() meta: Metadata, @Body() data: StartSagaDto): Observable<SagaDataSerializer> {
    return from(this.provider.sagas.start(data, { meta })).pipe(mapInstanceTo('data', SagaDataSerializer));
  }

  @Post('append')
  @ShipStrategy('create')
  @SetScope(Scope.AppendSpecialSagas)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Append, Resource.SpecialSagas)
  append(@Meta() meta: Metadata, @Body() data: AppendSagaHistoryDto): Observable<SagaHistoryDataSerializer> {
    return from(this.provider.sagas.append(data, { meta })).pipe(mapInstanceTo('data', SagaHistoryDataSerializer));
  }

  @Patch(':id/commit')
  @SetScope(Scope.CommitSpecialSagas)
  @SetPolicy(Action.Commit, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  commit(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return from(this.provider.sagas.commit(filter, { meta })).pipe(mapInstanceTo('data', SagaDataSerializer));
  }

  @Patch(':id/abort')
  @SetScope(Scope.AbortSpecialSagas)
  @SetPolicy(Action.Abort, Resource.SpecialSagas)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  abort(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Saga>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<SagaDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return from(this.provider.sagas.abort(filter, { meta })).pipe(mapInstanceTo('data', SagaDataSerializer));
  }
}
