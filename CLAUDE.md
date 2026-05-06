# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wenex Platform** is a large-scale, distributed microservices architecture built with NestJS (TypeScript/Node.js). It's a monorepo with 15+ microservices, multiple worker processes, shared libraries, and a GraphQL/REST gateway. The system uses MongoDB, PostgreSQL, Redis, Kafka, Elasticsearch, and MQTT for various operational needs.

- **Repository**: <https://github.com/wenex-org/platform>
- **Version**: 1.6.0
- **Node**: 22.x.x (see `.nvmrc`)
- **Package Manager**: pnpm@10.5.2
- **Architecture**: NestJS monorepo with gateway, services, workers, and shared libraries

## Repository Structure

```
platform/
├── apps/
│   ├── gateway/              # API Gateway (REST, GraphQL, MCP)
│   ├── services/             # 15 business domain microservices
│   │   ├── auth/             # Authentication & authorization
│   │   ├── domain, context, essential, financial, general, identity, special
│   │   ├── touch, content, logistic, conjoint, career, thing
│   └── workers/              # Background job processors
│       ├── dispatcher/       # Main job queue (BullMQ + Kafka)
│       ├── observer, preserver, watcher, publisher, logger, cleaner
├── libs/
│   ├── common/               # Shared utilities, DTOs, schemas, interceptors, guards
│   ├── module/               # Reusable NestJS modules (redis, logger, health, emqx, etc.)
│   ├── command/              # CLI commands for DB seeding, storage init
├── protos/                   # gRPC protobuf definitions (git submodule)
├── scripts/                  # Build, setup, proto generation, Kafka config
├── docker/                   # Docker Compose configs for dependencies
├── mcp/                      # Model Context Protocol documentation & tools
└── nest-cli.json            # NestJS monorepo configuration
```

## Core Architecture Concepts

### Service Communication

- **Gateway** (port 3010) → routes REST/GraphQL requests to services via gRPC
- **Services** expose REST (3020-3150) + gRPC (5020-5150) endpoints
- **Workers** (4010-4070) consume Kafka events and coordinate via BullMQ queues
- **Inter-service calls** use gRPC; **pub/sub events** use Kafka

### Data Layer Patterns

All services follow a **consistent CRUD pattern** documented in `docs/README.md`:

- `count()`, `create()`, `createBulk()`, `find()`, `findOne()`, `findById()`
- `updateOne()`, `updateById()`, `updateBulk()`
- `deleteOne()` / `deleteById()` (soft-delete), `restoreOne()`, `destroyOne()` (hard-delete)
- Every operation receives **`Metadata`** (auth context, user, client, tenant) and **`Filter`** (ownership, soft-delete, pagination)
- All return types use **RxJS Observables** for async streaming

### Database Strategy

- **MongoDB** (primary): entity data, soft-delete via `deleted_at` field
- **PostgreSQL**: Kafka offsets, stash logs, saga stage tracking (used by workers)
- **Redis**: caching, sessions, Kafka consumer groups, BullMQ job queue
- **Elasticsearch**: full-text search, analytics
- **MQTT (EMQX)**: real-time notifications, webhooks

### Key Services Overview

| Service | Purpose | Tech |
|---------|---------|------|
| **gateway** | API Gateway, GraphQL, REST routing, MCP server | Apollo, Express, NestJS |
| **auth** | OAuth, JWT, APT tokens, grants management | gRPC + REST |
| **domain** | Tenant/domain/account management | |
| **essential** | Core infrastructure (users, settings, notifications) | |
| **identity** | User profiles, permissions, access control | |
| **financial** | Billing, payments, transactions | |
| **dispatcher** | Main async job queue + Kafka producer | BullMQ, Kafka |
| **observer**, **preserver**, **watcher** | Event listeners and handlers | Kafka consumers |
| **logger**, **cleaner** | Logging aggregation, data retention cleanup | |

## Development Workflow

### Setup

```bash
# Clone and install
git clone git@github.com:wenex-org/platform.git
cd platform
cp .env.example .env
npm run git:clone              # Clone git submodules (protos)
pnpm install --frozen-lockfile
npm run script:setup           # Run machine + proto setup
```

### Building & Running

```bash
# Build entire project (runs in parallel)
npm run script:build

# Build single project
npm run build <project-name>   # e.g., npm run build auth

# Start specific service (watch mode)
npm run start:dev <service>    # e.g., npm run start:dev auth

# Start with debug support
npm run start:debug <service>
npm run start:debug2 <service> # Alternative debug port

# For E2E testing (uses e2e-prefixed DBs)
npm run start:dev:e2e <service>
npm run start:debug:e2e <service>
```

### Docker Compose

Essential utilities (MongoDB, Redis, Kafka, Elasticsearch, etc.):

```bash
docker-compose -f docker/docker-compose.yml up -d
```

Optional services (ELK, OTLP, TURN, SonarQube, etc.):

```bash
docker-compose -f docker/docker-compose.<service>.yml up -d
```

All services via Docker:

```bash
docker build -t wenex/platform:latest .
docker-compose --profile services up -d      # Services
docker-compose --profile workers up -d       # Workers
docker-compose --profile kafka-connect up    # Kafka sink connectors
```

### Database & Storage

```bash
# Seeding & indexing (production DB)
npm run db:seed                # Seed MongoDB
npm run db:index               # Create Elasticsearch indices
npm run storage:init           # Initialize MinIO buckets
npm run utility:init           # Configure EMQX webhooks

# For E2E tests (uses MONGO_PREFIX=e2e, etc.)
npm run db:seed:e2e
npm run db:index:e2e

# Kafka Connect configuration
npm run script:kafka-connect   # Configure sink connectors for logging
npm run script:kafka-connect:e2e  # E2E variant
```

### Testing

```bash
# Run all tests
npm run test

# Coverage report
npm run test:cov

# E2E tests (runs sequentially, requires services + DB setup)
npm run test:e2e
npm run test:e2e:cov

# Start services for E2E in separate terminal
npm run script:start:e2e auth domain context essential identity special gateway
# Then in another terminal
npm run script:start:e2e watcher observer preserver dispatcher logger
# Configure Kafka Connect
npm run script:kafka-connect:e2e
```

### Code Quality

```bash
# Format and lint
npm run format  # Prettier
npm run lint    # ESLint with auto-fix

# Circular dependency detection
npm run check
npm run madge:ts                # TypeScript mode
npm run madge:report:ts         # Generate dependency graph image
```

### CLI Commands

```bash
# Database operations
npm run db:seed                 # Seed MongoDB
npm run db:index                # Index Elasticsearch
npm run db:clean                # Drop collections
npm run db:debug                # Debug mode

# Storage & utilities
npm run storage:init
npm run storage:debug
npm run utility:init
npm run utility:debug
```

## Common NestJS Commands

These are standard nest-cli commands that work across the monorepo:

```bash
npm run build [project]        # Compile TypeScript to dist/
npm run start                  # Run (requires built code)
npm run start:dev [project]    # Watch + rebuild on changes
```

## Key File Locations & Patterns

### Shared Libraries

- **`libs/common/src/core/`** – Framework foundations
  - `envs/` – environment variable loaders + typed config
  - `dto/` – base request/response shapes
  - `interceptors/` – request/response transformation, ETag, request ID
  - `guards/` – auth, permissions, tenant scoping
  - `decorators/` – metadata-driven validators
  - `schemas/` – MongoDB Typegoose schemas
  - `serializers/` – output transformation (hide secrets, apply projections)
  - `utils/` – helpers for Mongo queries, Elasticsearch, Kafka

- **`libs/module/src/`** – Reusable NestJS modules
  - `redis/` – Redis client with retry logic
  - `logger/` – Log aggregation & Sentry integration
  - `health/` – Health check endpoints
  - `emqx/`, `sms/`, `email/`, `transfer/` – external service integrations

### Service Architecture

Each service follows the same structure:

```
apps/services/<name>/src/
├── main.ts               # Bootstrap: REST listener + gRPC server
├── app.module.ts         # Root module: imports, providers, DB config
├── app.service.ts        # Service-level health & initialization
├── app.proto             # gRPC service definition
├── modules/              # Feature modules
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts      # REST endpoints
│       ├── <feature>.service.ts         # Business logic + DB calls
│       ├── <feature>.repository.ts      # MongoDB Typegoose repository
│       ├── <feature>.schema.ts          # Mongoose schema
│       └── dto/
│           ├── <name>.dto.ts            # Input validation (class-validator)
│           └── <name>.serializer.ts     # Output transformation
├── protobuf/             # Generated gRPC client stubs
└── <optional>.router.ts  # MCP tool definitions
```

### Worker Architecture

Workers are different: they consume Kafka events and use BullMQ job queues:

```
apps/workers/<name>/src/
├── main.ts               # Bootstrap: Kafka consumer + HTTP listener
├── app.module.ts         # Imports: Kafka, BullMQ, Mongo, Postgres
├── app.processor.ts      # BullMQ job handler (decorated with @Process)
├── app.task.ts           # Scheduled tasks (@Cron)
├── app.service.ts        # Business logic
├── app.controller.ts     # HTTP endpoints (metrics, admin)
└── entities/             # TypeORM entities (for PostgreSQL)
```

## Configuration & Environment

See `.env.example` for the complete template. Key prefixes:

```
# Service discovery
AUTH_HOST, AUTH_API_PORT, AUTH_GRPC_PORT
DOMAIN_HOST, DOMAIN_API_PORT, etc. (pattern for all services)

# Database
MONGO_HOST, MONGO_DB, MONGO_USER, MONGO_PASS, MONGO_PREFIX
POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
REDIS_HOST, REDIS_PORT, REDIS_PREFIX

# Message queues
KAFKA_HOST, KAFKA_PORT
EMQX_BASE_URL, EMQX_USERNAME, EMQX_PASSWORD

# External services
ELASTICSEARCH_NODE
MINIO_HOST, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
SENTRY_DSN
ELASTIC_APM_SERVER_URL

# Observability
OTLP_HOST, OTLP_PORT
DEBUG=wnx:*
NODE_ENV=develop|production
```

For E2E tests, use prefixed databases:

```bash
MONGO_PREFIX=e2e REDIS_PREFIX=e2e ELASTIC_PREFIX=e2e POSTGRES_PREFIX=e2e npm run start:dev:e2e <service>
```

## Git Submodules

The `protos/` directory is a git submodule containing protobuf definitions:

```bash
# Already done by npm run git:clone, but if needed:
git submodule update --init --recursive
```

## MCP (Model Context Protocol) Integration

The gateway provides MCP tools for Claude and other agents:

- **HTTP endpoint**: `GET /mcp` (streamable transport)
- **Tool definitions**: `apps/gateway/src/**/*.router.ts` files
- **Documentation**: `mcp/` directory with specs for services & tools
- **Client**: `mcp-client.ts` (connects via HTTP, supports Ollama)

See `MCP.md` for refactor roadmap.

## Build & Deployment

### Build Process (`npm run script:build`)

1. Builds gateway first
2. Builds services in parallel (4 batches)
3. Builds workers in parallel (2 batches)
4. Copies `dist/` to `wnx/` directory
5. Total: ~3-4 minutes

### Docker Build

```bash
docker build -t wenex/platform:latest .
```

Stages:

1. Base image: `wenex/node:22-base` (Node 22 + pnpm)
2. Copy code, clone submodules, install deps, build
3. CMD: `node scripts/start.js` (starts essential service by default)

### CI/CD (.gitlab-ci.yml)

- **build** stage: installs deps, builds all projects, artifacts for 90 min
- **test** stage: runs full test suite
- **sonar** stage: SonarQube analysis (main branch only)
- **publish** stage: Kaniko builds & pushes images to registry (semver tags only)

## TypeScript Configuration

- **Target**: ES2021
- **Module**: CommonJS
- **Path aliases** (see `tsconfig.json`):
  - `@app/command/*` → `libs/command/src/*`
  - `@app/common/*` → `libs/common/src/*`
  - `@app/module/*` → `libs/module/src/*`
  - `@financial/*`, `@special/*`, `@logger/*`, `@dispatcher/*` → service-specific shortcuts

## Testing Strategy

- **Framework**: Jest
- **Config**: `jest.config.ts` (runs apps + libs)
- **E2E**: `jest-e2e.config.ts` (separate, slower, requires live services)
- **Patterns**:
  - Tests colocate with source (`*.spec.ts`)
  - E2E tests in `test/` directories
  - Use `supertest` for HTTP, service stubs for gRPC

## Performance & Constraints

- **Max workers**: Jest maxWorkers=2, maxConcurrency=4 (preserve system resources)
- **Node.js**: 22.x.x required
- **No Windows support** (uses bash scripts, symlinks)
- **Circular dependency checks**: Run `npm run check` before commit
- **Kafka consumer groups** are per-worker (e.g., `DISPATCHER_CONSUMER_GROUP_ID` in env)

## Important Notes for Developers

1. **Metadata is pervasive**: Every operation carries `meta: Metadata` (auth context, user, client, tenant). This enables ownership checks, soft-delete filtering, audit logging.

2. **Soft-delete by default**: Most `delete*` methods set `deleted_at`, not remove data. Use `destroy*` for hard delete.

3. **RxJS Observables everywhere**: Service methods return `Observable<T>`, not Promises. Controllers & resolvers subscribe.

4. **Proto regeneration**: After modifying `.proto` files, run `npm run script:proto` to regenerate TypeScript stubs.

5. **Graceful shutdown**: Workers use `nestjs-graceful-shutdown` for clean Kafka consumer termination.

6. **Health checks**: Each service exposes `GET /status` with checks for redis, mongo, kafka, pgsql, etc.

7. **Observability built-in**:
   - Prometheus metrics at `/metrics`
   - OpenTelemetry traces (OTLP)
   - Elastic APM in production
   - Sentry error tracking
   - Request tracing with `X-Request-ID`

8. **MCP tools**: Routers define MCP tools for AI agents (Claude, GPT); specs in `mcp/` docs.

## Quick References

| Task | Command |
|------|---------|
| Install deps | `pnpm install --frozen-lockfile` |
| Setup machine & protos | `npm run script:setup` |
| Build all | `npm run script:build` |
| Format & lint | `npm run format && npm run lint` |
| Run one service | `npm run start:dev auth` |
| Run all tests | `npm run test` |
| DB seed | `npm run db:seed` |
| Check circular deps | `npm run check` |
| Docker Compose up | `docker-compose -f docker/docker-compose.yml up -d` |
| E2E setup | `npm run db:seed:e2e && npm run db:index:e2e && npm run storage:init && npm run script:kafka-connect:e2e` |

---

**Last Updated**: 2026-05-06  
**Maintainer**: Vahid V. <vhid.vz@gmail.com>

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
