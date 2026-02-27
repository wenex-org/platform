import { MemberDataSerializer, MemberItemsSerializer, MemberSerializer } from '@app/common/serializers/conjoint';
import { GatewayInterceptors, ResponseInterceptors, WriteInterceptors } from '@app/common/core/interceptors';
import { Audit, Cache, RateLimit, SetPolicy, SetScope, Validation } from '@app/common/core/metadatas';
import { CreateMemberDto, CreateMemberItemsDto, UpdateMemberDto } from '@app/common/dto/conjoint';
import { FilterDto, FilterOneDto, QueryFilterDto } from '@app/common/core/dto/mongo';
import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Controller as ControllerClass } from '@app/common/core/classes/mongo';
import { Controller as IController } from '@app/common/core/interfaces/mongo';
import { AuthGuard, PolicyGuard, ScopeGuard } from '@app/common/core/guards';
import { AuthorityInterceptor } from '@app/common/core/interceptors/mongo';
import { Action, COLLECTION, Resource, Scope } from '@app/common/core';
import { Member, MemberDto } from '@app/common/interfaces/conjoint';
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

const COLL_PATH = COLLECTION('members', 'conjoint');

@Resolver()
@RateLimit(COLL_PATH)
@UsePipes(ValidationPipe)
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard, ScopeGuard, PolicyGuard)
@UseInterceptors(...GatewayInterceptors, new SentryInterceptor())
export class MembersResolver extends ControllerClass<Member, MemberDto> implements IController<Member, MemberDto> {
  constructor(readonly provider: ConjointProvider) {
    super(provider.members, MemberSerializer);
  }

  @Query(() => TotalSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMembers)
  @UseInterceptors(AuthorityInterceptor)
  @SetPolicy(Action.Read, Resource.ConjointMembers)
  countConjointMember(@Meta() meta: Metadata, @Filter() @Args('filter') filter: QueryFilterDto): Observable<TotalSerializer> {
    return super.count(meta, filter);
  }

  @Mutation(() => MemberDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMembers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/members', 'create')
  @SetPolicy(Action.Create, Resource.ConjointMembers)
  createConjointMember(@Meta() meta: Metadata, @Args('data') data: CreateMemberDto): Observable<MemberDataSerializer> {
    return super.create(meta, data);
  }

  @Mutation(() => MemberItemsSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMembers)
  @UseInterceptors(...WriteInterceptors)
  @Validation('conjoint/members', 'create')
  @SetPolicy(Action.Create, Resource.ConjointMembers)
  createConjointMemberBulk(@Meta() meta: Metadata, @Args('data') data: CreateMemberItemsDto): Observable<MemberItemsSerializer> {
    return super.createBulk(meta, data);
  }

  @Query(() => MemberItemsSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMembers)
  @SetPolicy(Action.Read, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointMember(
    @Meta() meta: Metadata,
    @Filter() @Args('filter') filter: FilterDto<Member>,
  ): Observable<MemberItemsSerializer> {
    return super.find(meta, filter);
  }

  @Query(() => MemberDataSerializer)
  @Cache(COLL_PATH, 'fill')
  @SetScope(Scope.ReadConjointMembers)
  @SetPolicy(Action.Read, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  findConjointMemberById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Member>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MemberDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.findOne(meta, filter);
  }

  @Mutation(() => MemberDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMembers)
  @SetPolicy(Action.Delete, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  deleteConjointMemberById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Member>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MemberDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.deleteOne(meta, filter);
  }

  @Mutation(() => MemberDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMembers)
  @SetPolicy(Action.Restore, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  restoreConjointMemberById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Member>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MemberDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.restoreOne(meta, filter);
  }

  @Mutation(() => MemberDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMembers)
  @SetPolicy(Action.Destroy, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...ResponseInterceptors)
  destroyConjointMemberById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterDto<Member>,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MemberDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.destroyOne(meta, filter);
  }

  @Mutation(() => TotalSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.ManageConjointMembers)
  @Validation('conjoint/members', 'update')
  @SetPolicy(Action.Update, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointMemberBulk(
    @Meta() meta: Metadata,
    @Args('data') update: UpdateMemberDto,
    @Filter() @Args('filter') filter: QueryFilterDto<Member>,
  ): Observable<TotalSerializer> {
    return super.updateBulk(meta, filter, update);
  }

  @Mutation(() => MemberDataSerializer)
  @Audit('GATEWAY')
  @Cache(COLL_PATH, 'flush')
  @SetScope(Scope.WriteConjointMembers)
  @Validation('conjoint/members', 'update')
  @SetPolicy(Action.Update, Resource.ConjointMembers)
  @UseInterceptors(AuthorityInterceptor, ...WriteInterceptors)
  updateConjointMemberById(
    @Args('id') id: string,
    @Meta() meta: Metadata,
    @Filter() filter: FilterOneDto<Member>,
    @Args('data') update: UpdateMemberDto,
    @Args('ref', { nullable: true }) ref?: string,
  ): Observable<MemberDataSerializer> {
    refineQueryGraphQL(filter, { id, ref });
    return super.updateOne(meta, filter, update);
  }
}
