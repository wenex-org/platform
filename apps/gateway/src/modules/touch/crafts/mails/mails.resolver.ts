import {
  TotalSerializer,
  MailDataSerializer,
  MailItemsSerializer,
  MailSerializer,
} from '@app/common/serializers';
import {
  CreateMailDto,
  FilterDto,
  FilterOneDto,
  QueryFilterDto,
  UpdateMailDto,
} from '@app/common/dto';
import {
  AuthorityInterceptor,
  FilterInterceptor,
  GatewayInterceptors,
  WriteInterceptors,
} from '@app/common/interceptors';
import {
  Controller as ControllerInterface,
  Metadata,
  Mail,
  MailDto,
} from '@app/common/interfaces';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Cache, SetPolicy, SetScope, ShipStrategy } from '@app/common/metadatas';
import { ParseIdPipe, ParseRefPipe, ValidationPipe } from '@app/common/pipes';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/guards';
import { Controller as ControllerClass } from '@app/common/classes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Filter, Meta, Session } from '@app/common/decorators';
import { Action, Resource, Scope } from '@app/common/enums';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AllExceptionsFilter } from '@app/common/filters';
import { TouchProvider } from '@app/common/providers';
import { refineFilterQuery } from '@app/common/utils';
import { ClientSession } from 'mongoose';
import { Observable } from 'rxjs';

@Resolver(() => MailSerializer)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MailsResolver
  extends ControllerClass<Mail, MailDto>
  implements ControllerInterface<Mail, MailDto>
{
  constructor(readonly provider: TouchProvider) {
    super(provider.mails, () => MailSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache('mails', 'fill')
  @SetScope(Scope.ReadTouchMails)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.TouchMails)
  countMail(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.count(meta, filter, session);
  }

  @Mutation(() => MailDataSerializer)
  @ShipStrategy('create')
  @Cache('mails', 'flush')
  @SetScope(Scope.WriteTouchMails)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  createMail(
    @Meta() meta: Metadata,
    @Args('data') data: CreateMailDto,
    @Session() session?: ClientSession,
  ): Observable<MailDataSerializer> {
    return super.create(meta, data, session);
  }

  @Mutation(() => MailItemsSerializer)
  @ShipStrategy('create')
  @Cache('mails', 'flush')
  @SetScope(Scope.WriteTouchMails)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.TouchMails)
  createBulkMail(
    @Meta() meta: Metadata,
    @Args('items', { type: () => [CreateMailDto] }) items: CreateMailDto[],
    @Session() session?: ClientSession,
  ): Observable<MailItemsSerializer> {
    return super.createBulk(meta, items, session);
  }

  @Query(() => MailItemsSerializer)
  @Cache('mails', 'fill')
  @SetScope(Scope.ReadTouchMails)
  @SetPolicy(Action.Read, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findMail(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Mail>,
    @Session() session?: ClientSession,
  ): Observable<MailItemsSerializer> {
    return super.find(meta, filter, session);
  }

  @Query(() => MailDataSerializer)
  @Cache('mails', 'fill')
  @SetScope(Scope.ReadTouchMails)
  @SetPolicy(Action.Read, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  findOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.findOne(meta, filter, session);
  }

  @Mutation(() => MailDataSerializer)
  @Cache('mails', 'flush')
  @SetScope(Scope.WriteTouchMails)
  @SetPolicy(Action.Delete, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  deleteOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.deleteOne(meta, filter, session);
  }

  @Mutation(() => MailDataSerializer)
  @Cache('mails', 'flush')
  @SetScope(Scope.WriteTouchMails)
  @SetPolicy(Action.Restore, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  restoreOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.restoreOne(meta, filter, session);
  }

  @Mutation(() => MailDataSerializer)
  @Cache('mails', 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Destroy, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, FilterInterceptor)
  destroyOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Mail>,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.destroyOne(meta, filter, session);
  }

  @Mutation(() => MailDataSerializer)
  @ShipStrategy('update')
  @Cache('mails', 'flush')
  @SetScope(Scope.WriteTouchMails)
  @SetPolicy(Action.Update, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateOneMail(
    @Args('id', ParseIdPipe) id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Mail>,
    @Args('data') update: UpdateMailDto,
    @Session() session?: ClientSession,
    @Args('ref', { nullable: true }, ParseRefPipe) ref?: string,
  ): Observable<MailDataSerializer> {
    refineFilterQuery(filter, { id, ref });
    return super.updateOne(meta, filter, update, session);
  }

  @Mutation(() => TotalSerializer)
  @ShipStrategy('update')
  @Cache('mails', 'flush')
  @SetScope(Scope.ManageTouchMails)
  @SetPolicy(Action.Update, Resource.TouchMails)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateBulkMail(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: QueryFilterDto<Mail>,
    @Args('data') update: UpdateMailDto,
    @Session() session?: ClientSession,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update, session);
  }
}
