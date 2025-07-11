# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- optional `icon` property to `CreateNoticeActionDto` @iranmanesh-dev

## [1.1.14] - 2025-07-12

### Fixed

- missing semicolon in `Activity` `message` @vhidvz

## [1.1.13] - 2025-07-12

### Added

- `message` added to `general/activities` @iranmanesh-dev
- `state` and `title` added to `special/files` @iranmanesh-dev

## [1.1.12] - 2025-07-08

### Fixed

- publish method in publisher worker to include database and collection in message payload @vhidvz

## [1.1.11] - 2025-07-08

### Added

- `x-can-with-id-policies` header to metadata keys @vhidvz
- `visited` added to `touch/notices` schema @iranmanesh-dev

## [1.1.10] - 2025-07-07

### Added

- `events` module added to `general` micro @vhidvz
- `visited` and `icon` props added to `touch/notices` @iranmanesh-dev

### Changed

- `general/notices` moved to `touch/notices` @vhidvz

## [1.1.9] - 2025-07-06

### Changed

- preserver authorization `[ID]` and `[SE]` @vhidvz

## [1.1.8] - 2025-07-05

### Added

- publisher worker to publish data change log on emqx topics @vhidvz

## [1.1.7] - 2025-07-02

### Fixed

- emqx retain message viewed not found @vhidvz
- emqx service token expiration exceptions @vhidvz

## [1.1.6] - 2025-06-24

### Added

- conjoint services @vhidvz

## [1.1.5] - 2025-06-11

### Fixed

- updateOwnership method to include uid in meta handling for improved user tracking @vhidvz

## [1.1.4] - 2025-06-11

### Fixed

- streamline grant deletion logic in GrantsService @vhidvz

## [1.1.3] - 2025-06-11

### Changed

- Add EVENT type to NoticeType enum @vhidvz

## [1.1.2] - 2025-06-10

### Changed

- refactor: simplify MongoHelper initialization in multiple services @vhidvz
- refactor: MongoHelper.init to improve model registration and population handling @vhidvz

## [1.1.1] - 2025-06-10

### Changed

- CI @vhidvz

## [1.1.0] - 2025-06-02

### Changed

- refactor: update DB_NAME function to use default prefix and adjust related tests @vhidvz
- refactor: change collection type in CqrsSourceDto and CqrsSource interface @vhidvz

## [1.0.X] - 2024-01-01

### Added

- initial release 🎉​🎊​.

[unreleased]: https://github.com/wenex-org/platform/compare/1.1.14...HEAD
[1.1.14]: https://github.com/wenex-org/platform/compare/1.1.13...1.1.14
[1.1.13]: https://github.com/wenex-org/platform/compare/1.1.12...1.1.13
[1.1.12]: https://github.com/wenex-org/platform/compare/1.1.11...1.1.12
[1.1.11]: https://github.com/wenex-org/platform/compare/1.1.10...1.1.11
[1.1.10]: https://github.com/wenex-org/platform/compare/1.1.9...1.1.10
[1.1.9]: https://github.com/wenex-org/platform/compare/1.1.8...1.1.9
[1.1.8]: https://github.com/wenex-org/platform/compare/1.1.7...1.1.8
[1.1.7]: https://github.com/wenex-org/platform/compare/1.1.6...1.1.7
[1.1.6]: https://github.com/wenex-org/platform/compare/1.1.5...1.1.6
[1.1.5]: https://github.com/wenex-org/platform/compare/1.1.4...1.1.5
[1.1.4]: https://github.com/wenex-org/platform/compare/1.1.3...1.1.4
[1.1.3]: https://github.com/wenex-org/platform/compare/1.1.2...1.1.3
[1.1.2]: https://github.com/wenex-org/platform/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/wenex-org/platform/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/wenex-org/platform/compare/1.0.42...1.1.0
[1.0.X]: https://github.com/wenex-org/platform/releases/tag/1.0.42
