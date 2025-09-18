# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.31] - 2025-09-18

### Added

- remove client from store if client is not meet preconditions in `dispatcher` worker @vhidvz

### Fixed

- fix: `script:kafka-connection` script to loading `.env` environments variables @vhidvz

## [1.2.30] - 2025-09-18

### Added

- added optional `state` field with default value pending to `financial/invoices` @iranmanesh-dev

### Changed

- refactor: dispatcher main job removed, simplified @vhidvz
- dispatcher disable job delay changed to `DISPATCHER_BULLMQ_LAST_ATTEMPT_PLUS_ONE` @vhidvz

### Fixed

- fix: type issue in `essential/sagas` @vhidvz
- fix: some circular dependencies and authority query group bug fixed @vhidvz

## [1.2.29] - 2025-09-16

### Added

- feat: add users group watcher worker module @vhidvz
- add property share to `x-file-data` on upload files @winkcor
- feat: enhance ownership handling using `user.groups` property @vhidvz
- feat: enhance authority exploits handling using `user.groups` property @vhidvz

### Fixed

- fix: bullmq dashboards by updating bullmq packages version @vhidvz

## [1.2.28] - 2025-09-15

### Added

- feat: add `Stashes` module and integrate with `dispatcher` service @vhidvz
- feat: add `dispatcher.stashes` module and integrate with `cleaner` service @vhidvz
- feat: add `ProjectionInterceptor` and related utilities for handling projections @vhidvz

### Changed

- indexed `general/workflows.data` schema @vhidvz
- removed on channel creation logic in `conjoint/channel` services @vhidvz
- refactor: update `SENSITIVE_PHRASES` to include `/api[_-]key$/` regex @vhidvz
- refactor: improve error handling in `fixInput` function @vhidvz
- refactor: enhance authorization logic in checkQueryExploits function @vhidvz
- refactor: enhance hooks to return values from before and after methods @vhidvz
- refactor(profiles): add restore onBeforeBulkUpdate method in `identity/profiles` @vhidvz
- make 'name' field optional in channel DTOs, interfaces, schemas, and serializers @vhidvz
- removed `projection` and `population` params from `findOneAndUpdate` and `findOneAndDelete` methods @vhidvz

### Fixed

- update workflow schema to allow mixed types for tokens @vhidvz
- escape special characters in topic replacement for authorization checks @vhidvz
- fix career service serializer number type @winkcor

## [1.2.27] - 2025-08-28

### Added

- `range` location field added to `career/employees` @vhidvz
- new metadata key `x-file-data` to include file data in requests @iranmanesh-dev
- new interceptor for handling header data for `special/files` upload @vhidvz
- new `Unicode` utility functions for text transformation @iranmanesh-dev

## [1.2.26] - 2025-08-23

### Added

- `attendees` field population to `identity/profiles` in `general/events` map @vhidvz
- `organizers` field population to `career/employees` in `general/events` map @iranmanesh-dev

### Changed

- fixed proto definition of `organizers` and `attendees` fields to be repeated @iranmanesh-dev

### Fixed

- proto `req.filter.populate` type definition for `essential/sagas` file @vhidvz

## [1.2.25] - 2025-08-19

### Fixed

- token needs in auth model to update user details for logger interceptor @vhidvz

## [1.2.24] - 2025-08-18

### Added

- audit log interceptor, decorator, module and worker @vhidvz
- request scope and policy to metadata keys and interceptor @vhidvz
- `cleaner` worker to purge data from `logger/audits` and `essential/saga.stages` @vhidvz

### Changed

- the `profile` field of `career/employees` was made optional @vhidvz
- streamline `collectStat` function and enhance `doc` handling @vhidvz
- refactor: enhance authorization checks in `onClientAuthorize` method @vhidvz
- replace `withSession` with `withSagaSession` in service methods for consistency @vhidvz

### Fixed

- throwing rpc exceptions on `AllExceptionsFilter` @vhidvz

## [1.2.23] - 2025-08-14

### Added

- `code` field to `career/branches` @iranmanesh-dev
- `profile` field to `career/employees` @iranmanesh-dev

### Changed

- Grant management during channel creation, deletion, and restoration @fdaei
- `general/events.organizer` field renamed to `general/events.organizers` @vhidvz

## [1.2.22] - 2025-08-10

### Changed

- updated `BusinessType` enum @vhidvz
- improved `dispatcher.transfer` method in failure scenario @vhidvz

## [1.2.21] - 2025-08-06

### Fixed

- command issues @vhidvz
- session `onAfterChange` condition issue @vhidvz
- config model validation schema for CQRS value @vhidvz
- businesses `categories` field in `career` proto @iranmanesh-dev
- file size validation changed from `isPositive` to `isNumber` @vhidvz

### Changed

- automatically registers models based base on map population definition @vhidvz
- set `x-saga...`, `x-can...`, `x-zone`, `x-at` metadata header to response header @vhidvz
- authorization model: special subject based on token identity to use for grants specification @vhidvz

## [1.2.20] - 2025-08-02

### Added

- optional field `status` added to `context/configs` interface @vhidvz
- optional field `status` added to `context/settings` interface @vhidvz

### Fixed

- `financial/wallets` schema @vhidvz

## [1.2.19] - 2025-08-02

### Added

- schema validation base on client config with `ValidationInterceptor` and `@Validation` decorator @vhidvz

## [1.2.18] - 2025-07-30

### Fixed

- financial currencies model and schema @vhidvz

### Changed

- mongodb seeds commands refactored @vhidvz
- `general/artifacts` and `context/settings` index @vhidvz

## [1.2.17] - 2025-07-30

### Added

- `categories` field added to `career/businesses` @iranmanesh-dev

### Changed

- `category` field name of `career/services` changed to `categories` @iranmanesh-dev
- resource limitation for `Elasticsearch` in `docker/docker-compose.elk.yml` @iranmanesh-dev

## [1.2.16] - 2025-07-27

### Added

- `career` micro and services @vhidvz

## [1.2.15] - 2025-07-24

### Added

- new service `career/businesses` libs added @vhidvz
- `name` and `title` as optional field to `logistic/locations` @vhidvz
- `message_time` and `message_size` added to `touch/email.smtp` @vhidvz

### Fixed

- GraphQL enum names to prefixed with service name @vhidvz

### Changed

- `identity` property moved to core schema as **optional mongo id string** @vhidvz

#### --- [ Breaking Changes ] !!!

- support population on a field with different models @vhidvz
- name of `identity` property in `context/configs` changed to `eid` @vhidvz
- name of `identity` property in `identity/profiles` changed to `national_code` @vhidvz
- name of `identity` property in `touch/email.smtp` property changed to `message_id` @vhidvz
- replaced `entity` mongo id property from `general/workflows` and replaced with `name` string @vhidvz

## [1.2.14] - 2025-07-22

### Added

- logistic location schema validation added to `properties` @vhidvz

### Changed

- core schema description index changed to `text` @vhidvz

### Fixed

- logistic locations `properties` property dto transformer @vhidvz

## [1.2.13] - 2025-07-19

### Added

- new metadata key `x-exclude-soft-delete-query` to ignore `assignSoftDeleteQuery` functionality @vhidvz

## [1.2.12] - 2025-07-19

### Changed

- add default permission scope `own`, `share` on none scoped action in `checkQueryExploits` @vhidvz

## [1.2.11] - 2025-07-19

### Changed

- scoped action logic in `setOwnership` of `canSet` method @vhidvz

## [1.2.10] - 2025-07-19

### Fixed

- correct order of `WriteInterceptors` @vhidvz

### Changed

- removed session scoped grant on `x-can-with-id-policies` @vhidvz

## [1.2.9] - 2025-07-17

### Added

- `scope` validation support on emqx `preserver` @vhidvz

## [1.2.8] - 2025-07-17

### Changed

- hot reload scope on refresh token with `[Scope.None]` @vhidvz

## [1.2.7] - 2025-07-17

### Fixed

- modelPlugin pre save issue @vhidvz

## [1.2.6] - 2025-07-17

### Fixed

- domain service provider mongoose enum validation check @vhidvz

## [1.2.5] - 2025-07-16

### Changed

- more control on constants using env with `INIT_` prefix @vhidvz

## [1.2.4] - 2025-07-16

### Changed

- refine limitation core constants @vhidvz

## [1.2.3] - 2025-07-15

### Fixed

- Swagger DTOs and Serializers name @vhidvz

## [1.2.2] - 2025-07-15

### Changed

- GraphQL DTOs name @vhidvz
- GraphQL Serializers name @iranmanesh-dev

## [1.2.1] - 2025-07-15

### Fixed

- GraphQL `account` overlap between service `financial` and `conjoint` @vhidvz

## [1.2.0] - 2025-07-15

### Fixed

- GraphQL function overlap between service modules with the same name @vhidvz

## [1.1.X] - 2025-07-15

### Added

- implement push history `content` and history DTOs, schemas, and serializers @vhidvz
- add `$text` operator support to `MONGO_OPERATION` for text search functionality @vhidvz
- `message` added to `general/activities` @iranmanesh-dev
- `state` and `title` added to `special/files` @iranmanesh-dev
- `x-can-with-id-policies` header to metadata keys @vhidvz
- `visited` added to `touch/notices` schema @iranmanesh-dev
- `events` module added to `general` micro @vhidvz
- `visited` and `icon` props added to `touch/notices` @iranmanesh-dev
- publisher worker to publish data change log on emqx topics @vhidvz
- conjoint services @vhidvz

### Changed

- send push match query @vhidvz
- implement push history `content` and history DTOs, schemas, and serializers @vhidvz
- optimize push retrieval query to include `session` and `identity` @vhidvz
- `general/notices` moved to `touch/notices` @vhidvz
- update payload structure in `publisher` method to include source details @vhidvz
- preserver authorization `[ID]` and `[SE]` @vhidvz
- Add EVENT type to NoticeType enum @vhidvz
- simplify MongoHelper initialization in multiple services @vhidvz
- MongoHelper.init to improve model registration and population handling @vhidvz
- CI @vhidvz
- update DB_NAME function to use default prefix and adjust related tests @vhidvz
- change collection type in CqrsSourceDto and CqrsSource interface @vhidvz

### Fixed

- update import statements to include `toString` utility in `content` DTOs @vhidvz
- `blacklist` field from `optional` to `repeated` in `touch/pushes` @vhidvz
- optional `icon` property to `CreateNoticeActionDto` @iranmanesh-dev
- correct spelling of `subtile` to `subtitle` in `touch/notices` @vhidvz
- missing semicolon in `Activity` `message` @vhidvz
- publish method in publisher worker to include database and collection in message payload @vhidvz
- emqx retain message viewed not found @vhidvz
- emqx service token expiration exceptions @vhidvz
- updateOwnership method to include uid in meta handling for improved user tracking @vhidvz
- streamline grant deletion logic in GrantsService @vhidvz

## [1.0.X] - 2021-01-01

### Added

- initial release 🎉​🎊​.

[unreleased]: https://github.com/wenex-org/platform/compare/1.2.31...HEAD
[1.2.31]: https://github.com/wenex-org/platform/compare/1.2.30...1.2.31
[1.2.30]: https://github.com/wenex-org/platform/compare/1.2.29...1.2.30
[1.2.29]: https://github.com/wenex-org/platform/compare/1.2.28...1.2.29
[1.2.28]: https://github.com/wenex-org/platform/compare/1.2.27...1.2.28
[1.2.27]: https://github.com/wenex-org/platform/compare/1.2.26...1.2.27
[1.2.26]: https://github.com/wenex-org/platform/compare/1.2.25...1.2.26
[1.2.25]: https://github.com/wenex-org/platform/compare/1.2.24...1.2.25
[1.2.24]: https://github.com/wenex-org/platform/compare/1.2.23...1.2.24
[1.2.23]: https://github.com/wenex-org/platform/compare/1.2.22...1.2.23
[1.2.22]: https://github.com/wenex-org/platform/compare/1.2.21...1.2.22
[1.2.21]: https://github.com/wenex-org/platform/compare/1.2.20...1.2.21
[1.2.20]: https://github.com/wenex-org/platform/compare/1.2.19...1.2.20
[1.2.19]: https://github.com/wenex-org/platform/compare/1.2.18...1.2.19
[1.2.18]: https://github.com/wenex-org/platform/compare/1.2.17...1.2.18
[1.2.17]: https://github.com/wenex-org/platform/compare/1.2.16...1.2.17
[1.2.16]: https://github.com/wenex-org/platform/compare/1.2.15...1.2.16
[1.2.15]: https://github.com/wenex-org/platform/compare/1.2.14...1.2.15
[1.2.14]: https://github.com/wenex-org/platform/compare/1.2.13...1.2.14
[1.2.13]: https://github.com/wenex-org/platform/compare/1.2.12...1.2.13
[1.2.12]: https://github.com/wenex-org/platform/compare/1.2.11...1.2.12
[1.2.11]: https://github.com/wenex-org/platform/compare/1.2.10...1.2.11
[1.2.10]: https://github.com/wenex-org/platform/compare/1.2.9...1.2.10
[1.2.9]: https://github.com/wenex-org/platform/compare/1.2.8...1.2.9
[1.2.8]: https://github.com/wenex-org/platform/compare/1.2.7...1.2.8
[1.2.7]: https://github.com/wenex-org/platform/compare/1.2.6...1.2.7
[1.2.6]: https://github.com/wenex-org/platform/compare/1.2.5...1.2.6
[1.2.5]: https://github.com/wenex-org/platform/compare/1.2.4...1.2.5
[1.2.4]: https://github.com/wenex-org/platform/compare/1.2.3...1.2.4
[1.2.3]: https://github.com/wenex-org/platform/compare/1.2.2...1.2.3
[1.2.2]: https://github.com/wenex-org/platform/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/wenex-org/platform/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/wenex-org/platform/compare/1.1.20...1.2.0
[1.1.X]: https://github.com/wenex-org/platform/compare/1.0.42...1.1.20
[1.0.X]: https://github.com/wenex-org/platform/releases/tag/1.0.42
