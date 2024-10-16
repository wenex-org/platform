import { CreateMailDto, CreateMailItemsDto, FilterDto, FilterOneDto, QueryFilterDto, UpdateMailDto } from '@app/common/dto';
import { AuthorityInterceptor, FilterInterceptor, GatewayInterceptors, WriteInterceptors } from '@app/common/interceptors';
import { TotalSerializer, MailDataSerializer, MailItemsSerializer, MailSerializer } from '@app/common/serializers';
import { Controller as ControllerInterface, Metadata, Mail, MailDto } from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { Action, Collection, Resource, Scope } from '@app/common/enums';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { Filter, Meta } from '@app/common/decorators';
import { Observable } from 'rxjs';

@Resolver(() => MailSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MailsResolver extends ControllerClass<Mail, MailDto> implements ControllerInterface<Mail, MailDto> {
  constructor(readonly provider: TouchProvider) {
    super(provider.mails, () => MailSerializer);
  }

  @Query(() => TotalSerializer)
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchMails)
  countMail(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => MailDataSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  createMail(@Meta() meta: Metadata, @Args('data') data: CreateMailDto): Observable<MailDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => MailItemsSerializer)
  @ShipStrategy('create')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  createBulkMail(@Meta() meta: Metadata, @Args('data') data: CreateMailItemsDto): Observable<MailItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => MailItemsSerializer)
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @SetPolicy(Action.Read, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findMail(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Mail>): Observable<MailItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => MailDataSerializer)
  @SetScope(Scope.ReadTouchMails)
  @Cache(Collection.Mails, 'fill')
  @SetPolicy(Action.Read, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => MailDataSerializer)
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Delete, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => MailDataSerializer)
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Restore, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => MailDataSerializer)
  @Cache(Collection.Mails, 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Destroy, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => MailDataSerializer)
  @ShipStrategy('update')
  @SetScope(Scope.WriteTouchMails)
  @Cache(Collection.Mails, 'flush')
  @SetPolicy(Action.Update, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Args('data') update: UpdateMailDto,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache(Collection.Mails, 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Update, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkMail(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Mail>,
    @Args('data') update: UpdateMailDto,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }
}
