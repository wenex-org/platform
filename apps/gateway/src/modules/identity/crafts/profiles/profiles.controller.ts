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
  CreateProfileDto,
  CreateProfileItemsDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateProfileDto,
} from '@app/common/dto';
import { TotalSerializer, ProfileDataSerializer, ProfileItemsSerializer, ProfileSerializer } from '@app/common/serializers';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { Controller as ControllerInterface, Metadata, Profile, ProfileDto } from '@app/common/interfaces';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { getMessageEvent, refineFilterQuery } from '@app/common/utils';
import { Controller as ControllerClass } from '@app/common/classes';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { IdentityProvider } from '@app/common/providers';
import { Filter, Meta } from '@app/common/decorators';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@UsePipes(ValidationPipe)
@ApiTags(Collection.Profiles)
@Controller(Collection.Profiles)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProfilesController extends ControllerClass<Profile, ProfileDto> implements ControllerInterface<Profile, ProfileDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, () => ProfileSerializer);
  }

  @Get('count')
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  create(@Meta() meta: Metadata, @Body() data: CreateProfileDto): Observable<ProfileDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  createBulk(@Meta() meta: Metadata, @Body() data: CreateProfileItemsDto): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @ApiQuery({ type: FilterDto, required: false })
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Profile>): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ProfileSerializer, description: 'SSE' })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Profile>) {
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
  @Cache(Collection.Profiles, 'fill')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  FindOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Delete, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DeleteOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Restore, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  RestoreOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Destroy, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  DestroyOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Profile>,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.WriteIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateOne(
    @Param('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Body() update: UpdateProfileDto,
    @Query('ref', ParseRefPipe) ref?: string,
  ): Observable<ProfileDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @Cache(Collection.Profiles, 'flush')
  @SetScope(Scope.ManageIdentityProfiles)
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  UpdateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Profile>,
    @Body() update: UpdateProfileDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
