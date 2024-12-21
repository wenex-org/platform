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
import { ProfileDataSerializer, ProfileItemsSerializer, ProfileSerializer } from '@app/common/serializers/identity';
import { CreateProfileDto, CreateProfileItemsDto, UpdateProfileDto } from '@app/common/dto/identity';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Profile, ProfileDto } from '@app/common/interfaces/identity';
import { IdentityProvider } from '@app/common/providers/identity';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { getSseMessage } from '@app/common/core/utils';
import { Metadata } from '@app/common/core/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';

@ApiBearerAuth()
@RateLimit('profiles')
@UsePipes(ValidationPipe)
@ApiTags(Collection.Profiles)
@Controller(Collection.Profiles)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ProfilesController extends ControllerClass<Profile, ProfileDto> implements IController<Profile, ProfileDto> {
  constructor(readonly provider: IdentityProvider) {
    super(provider.profiles, ProfileSerializer);
  }

  @Get('count')
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  override count(@Meta() meta: Metadata, @Filter() filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Post()
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  override create(@Meta() meta: Metadata, @Body() data: CreateProfileDto): Observable<ProfileDataSerializer> {
    return super.create(meta, data);
  }

  @Post('bulk')
  @ShipStrategy('create')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @ApiResponse({ type: ProfileItemsSerializer })
  @SetPolicy(Action.Create, Resource.IdentityProfiles)
  override createBulk(@Meta() meta: Metadata, @Body() data: CreateProfileItemsDto): Observable<ProfileItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Get()
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiResponse({ type: ProfileItemsSerializer })
  @ApiQuery({ type: FilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override find(@Meta() meta: Metadata, @Filter() filter: FilterDto<Profile>): Observable<ProfileItemsSerializer> {
    return super.find(meta, filter);
  }

  @Get('cursor')
  @SetScope(Scope.ReadIdentityProfiles)
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: FilterOneDto, required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  @ApiResponse({ status: HttpStatus.OK, type: ProfileSerializer })
  Cursor(@Res() res: Response, @Meta() meta: Metadata, @Filter() filter: FilterOneDto<Profile>) {
    // Server Sent-Event Headers
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store');

    super.cursor(meta, filter).subscribe({
      next: (data) => res.write(getSseMessage({ id: data.id, data })),
      error: (data) => res.end(getSseMessage({ event: 'error', data })),
      complete: () => res.end(getSseMessage({ type: 'close', event: 'end' })),
    });
  }

  @Get(':id')
  @SetScope(Scope.ReadIdentityProfiles)
  @Cache(Collection.Profiles, 'fill')
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Read, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override findOne(@Meta() meta: Metadata, @Filter() filter: FilterOneDto<Profile>): Observable<ProfileDataSerializer> {
    return super.findOne(meta, filter);
  }

  @Delete(':id')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Delete, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override deleteOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Profile>): Observable<ProfileDataSerializer> {
    return super.deleteOne(meta, filter);
  }

  @Put(':id/restore')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Restore, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override restoreOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Profile>): Observable<ProfileDataSerializer> {
    return super.restoreOne(meta, filter);
  }

  @Delete(':id/destroy')
  @SetScope(Scope.ManageIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Destroy, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  override destroyOne(@Meta() meta: Metadata, @Filter() filter: FilterDto<Profile>): Observable<ProfileDataSerializer> {
    return super.destroyOne(meta, filter);
  }

  @Patch('bulk')
  @ShipStrategy('update')
  @SetScope(Scope.ManageIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @ApiQuery({ type: QueryFilterDto, required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateBulk(
    @Meta() meta: Metadata,
    @Filter() filter: QueryFilterDto<Profile>,
    @Body() update: UpdateProfileDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Patch(':id')
  @ShipStrategy('update')
  @SetScope(Scope.WriteIdentityProfiles)
  @Cache(Collection.Profiles, 'flush')
  @ApiResponse({ type: ProfileDataSerializer })
  @SetPolicy(Action.Update, Resource.IdentityProfiles)
  @ApiQuery({ type: String, name: 'ref', required: false })
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  override updateOne(
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Profile>,
    @Body() update: UpdateProfileDto,
  ): Observable<ProfileDataSerializer> {
    return super.updateOne(meta, filter, update);
  }
}