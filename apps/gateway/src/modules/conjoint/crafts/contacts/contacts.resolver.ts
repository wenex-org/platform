import { ContactDataSerializer, ContactItemsSerializer, ContactSerializer } from '@app/common/serializers/conjoint';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { CreateContactDto, CreateContactItemsDto, UpdateContactDto } from '@app/common/dto/conjoint';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { Cache, RateLimit, SetPolicy, SetScope } from '@app/common/core/metadatas';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Contact, ContactDto } from '@app/common/interfaces/conjoint';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { refineQueryGraphQL } from '@app/common/core/utils/mongo';
import { ConjointProvider } from '@app/common/providers/conjoint';
import { AllExceptionsFilter } from '@app/common/core/filters';
import { TotalSerializer } from '@app/common/core/serializers';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { Filter, Meta } from '@app/common/core/decorators';
import { ValidationPipe } from '@app/common/core/pipes';
import { Metadata } from '@app/common/core/interfaces';
import { Observable } from 'rxjs';

const COLL_PATH = COLLECTION('contacts', 'conjoint');

@Resolver(() => ContactSerializer)
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class ContactsResolver extends ControllerClass<Contact, ContactDto> implements IController<Contact, ContactDto> {
  constructor(readonly provider: ConjointProvider) {
    super(provider.contacts, ContactSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointContacts)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConjointContacts)
  countContact(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointContacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConjointContacts)
  createContact(@Meta() meta: Metadata, @Args('data') data: CreateContactDto): Observable<ContactDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => ContactItemsSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointContacts)
  @UseInterceptors(...WriteInterceptors)
  @SetPolicy(Action.Create, Resource.ConjointContacts)
  createContactBulk(@Meta() meta: Metadata, @Args('data') data: CreateContactItemsDto): Observable<ContactItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => ContactItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointContacts)
  @SetPolicy(Action.Read, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContact(@Meta() meta: Metadata, @Filter() @Args('filter') filter: FilterDto<Contact>): Observable<ContactItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointContacts)
  @SetPolicy(Action.Read, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findContactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Contact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointContacts)
  @SetPolicy(Action.Delete, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteContactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Contact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointContacts)
  @SetPolicy(Action.Restore, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreContactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Contact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointContacts)
  @SetPolicy(Action.Destroy, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyContactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Contact>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointContacts)
  @SetPolicy(Action.Update, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContactBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateContactDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Contact>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => ContactDataSerializer)
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointContacts)
  @SetPolicy(Action.Update, Resource.ConjointContacts)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateContactById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Contact>,
    @Args('data') update: UpdateContactDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<ContactDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
