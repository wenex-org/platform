# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- add `auth/apts` service @vhidvz

### Fixed

- perform: `jobId` in dispatcher @vhidvz

## [1.4.2] - 2025-12-17

### Fixed

- fix schema type special in mongo @fdaei

## [1.4.1] - 2025-12-01

### Changed

- financial transaction some improvements @vhidvz

### Fixed

- fix Store Dto in fork enum @m-hadi-arefi

## [1.4.0] - 2025-11-21

### Added

- add `stocks`, `stores`, `products` and `customers` modules to `career` service @vhidvz

## [1.3.X] - 2025-11-16

### Added

- add fuzzy search by elasticsearch to `conjoint.messages` @vhidvz
- add `sta` and `suggest` subfields for elasticsearch indices @vhidvz
- add x-lang header in metadata @fdaei
- improve: cant sent message when channel is not applicable @fdaei
- feat: mcp integration first try @vhidvz
- add `Brotli` helper in core @vhidvz
- add `display_name` field to `Place` type of `logistic.locations` @vhidvz
- `profit` and `discount` to `financial/invoices` in `invoice.items` @vhidvz
- feat: add file sharing @vhidvz
- added more log to `essential.sagas` service @vhidvz

### Changed

- removed: unused code from `user` schema @vhidvz
- set default value for `identity/users.secret` with random 40 hex chars @vhidvz
- change the user dto condition in the `username` field must not be an email or phone number @vhidvz
- update population of mongo runner in `findOneAndUpdate` and `findOneAndDelete` @vhidvz
- style: health check improvements @vhidvz
- transform `value` to lowercase in `identity/users.email` @vhidvz
- make `NominatimPlaceAddress.city` optional @vhidvz
- support brotli compression on query string @vhidvz
- replaced `Brotli` helper dependencies package with `brotli-wasm` @vhidvz
- update kafka connect script to capture `emails`, `pushes` and `smss` from touch db @vhidvz
- refactor: model value in client domain of watcher worker @vhidvz
- create grants for new domain @fdaei
- validate domain before create it @fdaei
- capture full response of webpush in `props` @vhidvz
- refactor: client domain logic for root grant of each in domain watcher worker @vhidvz
- update mongodb options @vhidvz
- add `KafkaContext.heartbeat` to stat model @vhidvz
- update mongodb options @vhidvz
- refactor: `essential.sagas` exception handling improvements @vhidvz
- add `MONGO_LOAD_BALANCED` env @vhidvz
- enable trust proxy for real client IP @fdaei
- update redis health check @vhidvz
- remove kafka health check from `essential` @vhidvz
- remove `special` micro from gateway health check @vhidvz
- remove `retryWrites` and `retryReads` from mongodb config options @vhidvz
- remove `maxInFlightRequests` and `idempotent` options from kafka connection @vhidvz
- health check improvements and kafka retry.retries changed to max safe int @vhidvz
- set `autoCommit` to false for `essential.saga` service @vhidvz
- some improvements for stability in kafka options @vhidvz
- some implement in `saga` module @vhidvz
- refactor and optimize `essential` service @vhidvz
- refactor and some improvements `observer` worker @vhidvz

### Fixed

- Check `onBeforeCreate`; if a user already exists on another client, just update `clients` instead @fdaei
- inactive user creation issue for new client @fdaei
- fix: `whole` scope on `preserver` @vhidvz
- fix content type in header @fdaei
- add cache control public to public files @winkcor
- Add `nullable=True` to Core serializer for props @fdaei
- add cross origin for resources headers `crossOriginResourcePolicy` @winkcor
- revert: cross origin issue @vhidvz
- cross origin issue @vhidvz
- fix: `bool_result` undefined issue in `preserver` worker @vhidvz
- fix cursor response header `Content-Type` @winkcor
- fix: add `profit` and `discount` in `financial/invoices` and `invoice.items` in protobuf @vhidvz
- download file using `token` in url query string @vhidvz
- population `policies` issue base on `subjects` @vhidvz
- `loadBalanced is only a valid option in the URI` issue @vhidvz
- `saga session expired` issue @vhidvz
- essential scale issues @vhidvz
- fix paymentValue function to give correct amount for init transaction @winkcor
- refactor: essential saga service @vhidvz
- health check redis connection stick issue @vhidvz

## [1.2.X] - 2025-09-29

#### --- [ Breaking Changes ] !!!

- support population on a field with different models @vhidvz
- name of `identity` property in `context/configs` changed to `eid` @vhidvz
- name of `identity` property in `identity/profiles` changed to `national_code` @vhidvz
- name of `identity` property in `touch/email.smtp` property changed to `message_id` @vhidvz
- replaced `entity` mongo id property from `general/workflows` and replaced with `name` string @vhidvz

### Added

- remove OTP_SECRET validation from AuthCheckDto @fdaei
- add `check` rpc method to `AuthsService` @vhidvz
- add `OnModuleInit` to `AuditLogger` for test connectivity @vhidvz
- remove client from store if client is not meet preconditions in `dispatcher` worker @vhidvz
- added optional `state` field with default value pending to `financial/invoices` @iranmanesh-dev
- feat: add users group watcher worker module @vhidvz
- add property share to `x-file-data` on upload files @winkcor
- feat: enhance ownership handling using `user.groups` property @vhidvz
- feat: enhance authority exploits handling using `user.groups` property @vhidvz
- feat: add `Stashes` module and integrate with `dispatcher` service @vhidvz
- feat: add `dispatcher.stashes` module and integrate with `cleaner` service @vhidvz
- feat: add `ProjectionInterceptor` and related utilities for handling projections @vhidvz
- `range` location field added to `career/employees` @vhidvz
- new metadata key `x-file-data` to include file data in requests @iranmanesh-dev
- new interceptor for handling header data for `special/files` upload @vhidvz
- new `Unicode` utility functions for text transformation @iranmanesh-dev
- `attendees` field population to `identity/profiles` in `general/events` map @vhidvz
- `organizers` field population to `career/employees` in `general/events` map @iranmanesh-dev
- audit log interceptor, decorator, module and worker @vhidvz
- request scope and policy to metadata keys and interceptor @vhidvz
- `cleaner` worker to purge data from `logger/audits` and `essential/saga.stages` @vhidvz
- `code` field to `career/branches` @iranmanesh-dev
- `profile` field to `career/employees` @iranmanesh-dev
- optional field `status` added to `context/configs` interface @vhidvz
- optional field `status` added to `context/settings` interface @vhidvz
- schema validation base on client config with `ValidationInterceptor` and `@Validation` decorator @vhidvz
- `categories` field added to `career/businesses` @iranmanesh-dev
- `career` micro and services @vhidvz
- new service `career/businesses` libs added @vhidvz
- `name` and `title` as optional field to `logistic/locations` @vhidvz
- `message_time` and `message_size` added to `touch/email.smtp` @vhidvz
- logistic location schema validation added to `properties` @vhidvz
- new metadata key `x-exclude-soft-delete-query` to ignore `assignSoftDeleteQuery` functionality @vhidvz
- `scope` validation support on emqx `preserver` @vhidvz

### Changed

- some improvements in kafka health check @vhidvz
- health check refinement for kafka consumers @vhidvz
- add `producerOnlyMode` to kafka producers @vhidvz
- refine health check in all microservices @vhidvz
- make logger kafka producer only mode @vhidvz
- update all microservices health check @vhidvz
- update log level of kafkajs to `INFO` @vhidvz
- update `KAFKA_CLIENT` and `CONSUMER_CONFIG` to have more stability in consumers @vhidvz
- improve concurrency in stats model and observer worker @vhidvz
- update `KAFKA_CLIENT` and `CONSUMER_CONFIG` to have more stability in consumers @vhidvz
- update nestjs version from `11.0.4` to `11.0.21` @vhidvz
- update `script:kafka-connect` to include some collection not all @vhidvz
- update consumer/client options to have more stability in consumers @vhidvz
- authority `exclude-soft-delete-query` condition changed @vhidvz
- refactor: dispatcher main job removed, simplified @vhidvz
- dispatcher disable job delay changed to `DISPATCHER_BULLMQ_LAST_ATTEMPT_PLUS_ONE` @vhidvz
- indexed `general/workflows.data` schema @vhidvz
- removed on channel creation logic in `conjoint/channel` services @vhidvz
- refactor: update `SENSITIVE_PHRASES` to include `/api[_-]key$/` regex @vhidvz
- refactor: improve error handling in `fixInput` function @vhidvz
- refactor: enhance authorization logic in checkQueryExploits function @vhidvz
- refactor: enhance hooks to return values from before and after methods @vhidvz
- refactor(profiles): add restore onBeforeBulkUpdate method in `identity/profiles` @vhidvz
- make 'name' field optional in channel DTOs, interfaces, schemas, and serializers @vhidvz
- removed `projection` and `population` params from `findOneAndUpdate` and `findOneAndDelete` methods @vhidvz
- fixed proto definition of `organizers` and `attendees` fields to be repeated @iranmanesh-dev
- the `profile` field of `career/employees` was made optional @vhidvz
- streamline `collectStat` function and enhance `doc` handling @vhidvz
- refactor: enhance authorization checks in `onClientAuthorize` method @vhidvz
- replace `withSession` with `withSagaSession` in service methods for consistency @vhidvz
- Grant management during channel creation, deletion, and restoration @fdaei
- `general/events.organizer` field renamed to `general/events.organizers` @vhidvz
- updated `BusinessType` enum @vhidvz
- improved `dispatcher.transfer` method in failure scenario @vhidvz
- automatically registers models based base on map population definition @vhidvz
- set `x-saga...`, `x-can...`, `x-zone`, `x-at` metadata header to response header @vhidvz
- authorization model: special subject based on token identity to use for grants specification @vhidvz
- mongodb seeds commands refactored @vhidvz
- `general/artifacts` and `context/settings` index @vhidvz
- `category` field name of `career/services` changed to `categories` @iranmanesh-dev
- resource limitation for `Elasticsearch` in `docker/docker-compose.elk.yml` @iranmanesh-dev
- `identity` property moved to core schema as **optional mongo id string** @vhidvz
- core schema description index changed to `text` @vhidvz
- add default permission scope `own`, `share` on none scoped action in `checkQueryExploits` @vhidvz
- scoped action logic in `setOwnership` of `canSet` method @vhidvz
- removed session scoped grant on `x-can-with-id-policies` @vhidvz
- hot reload scope on refresh token with `[Scope.None]` @vhidvz
- more control on constants using env with `INIT_` prefix @vhidvz
- refine limitation core constants @vhidvz
- GraphQL DTOs name @vhidvz
- GraphQL Serializers name @iranmanesh-dev

### Fixed

- health check for kafka server issue @vhidvz
- fix: emqx unique client id issue @vhidvz
- `SIGTERM` signal handling in `start.js` script to ensure proper shutdown of child processes @vhidvz
- fix: stat issue on mongo transaction error @vhidvz
- fix: `script:kafka-connection` script to loading `.env` environments variables @vhidvz
- fix: type issue in `essential/sagas` @vhidvz
- fix: some circular dependencies and authority query group bug fixed @vhidvz
- fix: bullmq dashboards by updating bullmq packages version @vhidvz
- update workflow schema to allow mixed types for tokens @vhidvz
- escape special characters in topic replacement for authorization checks @vhidvz
- fix career service serializer number type @winkcor
- proto `req.filter.populate` type definition for `essential/sagas` file @vhidvz
- token needs in auth model to update user details for logger interceptor @vhidvz
- throwing rpc exceptions on `AllExceptionsFilter` @vhidvz
- command issues @vhidvz
- session `onAfterChange` condition issue @vhidvz
- config model validation schema for CQRS value @vhidvz
- businesses `categories` field in `career` proto @iranmanesh-dev
- file size validation changed from `isPositive` to `isNumber` @vhidvz
- `financial/wallets` schema @vhidvz
- financial currencies model and schema @vhidvz
- GraphQL enum names to prefixed with service name @vhidvz
- logistic locations `properties` property dto transformer @vhidvz
- correct order of `WriteInterceptors` @vhidvz
- modelPlugin pre save issue @vhidvz
- domain service provider mongoose enum validation check @vhidvz
- Swagger DTOs and Serializers name @vhidvz
- GraphQL `account` overlap between service `financial` and `conjoint` @vhidvz
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

[unreleased]: https://github.com/wenex-org/platform/compare/1.4.2...HEAD
[1.4.2]: https://github.com/wenex-org/platform/compare/1.4.1...1.4.2
[1.4.1]: https://github.com/wenex-org/platform/compare/1.4.0...1.4.1
[1.4.0]: https://github.com/wenex-org/platform/compare/1.3.39...1.4.0
[1.3.X]: https://github.com/wenex-org/platform/compare/1.2.49...1.3.39
[1.2.X]: https://github.com/wenex-org/platform/compare/1.1.20...1.2.49
[1.1.X]: https://github.com/wenex-org/platform/compare/1.0.42...1.1.20
[1.0.X]: https://github.com/wenex-org/platform/releases/tag/1.0.42
