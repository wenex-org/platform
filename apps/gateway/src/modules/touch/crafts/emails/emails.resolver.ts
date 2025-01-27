import { EmailDataSerializer, EmailItemsSerializer, EmailSerializer } from '@app/common/serializers/touch';
import { Cache, RateLimit, SetPolicy, SetScope, ShipStrategy } from '@app/common/core/metadatas';
import { CreateEmailDto, CreateEmailItemsDto, UpdateEmailDto } from '@app/common/dto/touch';
import { GatewayInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { TransformerPipe, ValidationPipe } from '@app/common/core/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/core';
import { FilterInterceptor } from '@app/common/core/interceptors/flow';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { Email, EmailDto } from '@app/common/interfaces/touch';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { TouchProvider } from '@app/common/providers/touch';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

@Resolver(() => EmailSerializer)
@RateLimit('emails')
@UseFilters(AllExceptionsFilter)
@UsePipes(TransformerPipe, ValidationPipe)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class EmailsResolver extends ControllerClass<Email, EmailDto> implements IController<Email, EmailDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.emails, EmailSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  countEmail(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => EmailDataSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchEmails)
  createEmail(@Meta() meta: Metadata, @Args('data') data: CreateEmailDto): Observable<EmailDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => EmailItemsSerializer)
  @ShipStrategy('create')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchEmails)
  createEmailBulk(@Meta() meta: Metadata, @Args('data') data: CreateEmailItemsDto): Observable<EmailItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => EmailItemsSerializer)
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findEmail(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Email>): Observable<EmailItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => EmailDataSerializer)
  @Cache(Collection.Emails, 'fill')
  @SetScope(Scope.ReadTouchEmails)
  @SetPolicy(Action.Read, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findEmailById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Email>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmailDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => EmailDataSerializer)
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @SetPolicy(Action.Delete, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteEmailById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Email>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmailDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => EmailDataSerializer)
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @SetPolicy(Action.Restore, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreEmailById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Email>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmailDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => EmailDataSerializer)
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @SetPolicy(Action.Destroy, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyEmailById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Email>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmailDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.ManageTouchEmails)
  @SetPolicy(Action.Update, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEmailBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateEmailDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Email>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => EmailDataSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Emails, 'flush')
  @SetScope(Scope.WriteTouchEmails)
  @SetPolicy(Action.Update, Resource.TouchEmails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateEmailById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Email>,
    @Args('data') update: UpdateEmailDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<EmailDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
