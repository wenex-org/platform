# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- mongodb seeds commands refactored @vhidvz

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

## [1.0.X] - 2024-01-01

### Added

- initial release 🎉​🎊​.

[unreleased]: https://github.com/wenex-org/platform/compare/1.2.17...HEAD
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
