import { Body, Controller, Post, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { FieldInterceptor, FilterInterceptor, GatewayInterceptors } from '@app/common/interceptors';
import { BoundaryAdministrativeSerializer } from '@app/common/serializers';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { SetPolicy, SetScope } from '@app/common/metadatas';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogisticProvider } from '@app/common/providers';
import { ValidationPipe } from '@app/common/pipes';
import { Metadata } from '@app/common/interfaces';
import { Meta } from '@app/common/decorators';
import { LatLngDto } from '@app/common/dto';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Locations)
@UseFilters(AllExceptionsFilter)
@Controller(Collection.Locations)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class LocationsInspector {
  constructor(readonly provider: LogisticProvider) {}

  @Post('location-to-address')
  @SetScope(Scope.ResolveLogisticLocations)
  @SetPolicy(Action.Send, Resource.LogisticLocations)
  @UseInterceptors(FieldInterceptor, FilterInterceptor)
  async locationToAddress(@Meta() meta: Metadata, @Body() data: LatLngDto): Promise<BoundaryAdministrativeSerializer> {
    return this.provider.locations.locationToAddress(data, meta);
  }
}
