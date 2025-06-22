# Quick Start

```sh
git clone git@github.com:wenex-org/platform.git
```

```sh
cd platform
cp .env.example .env

# Clone git submodules
npm run git:clone
npm run git checkout main

# Install node dependencies
pnpm install --frozen-lockfile
```

**Next Step**:

- [Add Remote (Optional)](#add-remote-optional)
- [Start Essential Utilities](#start-essential-utilities)
- [DB Seeding and Initialization](#db-seeding-and-initialization)
- [Start Up and Running using Docker](#start-up-and-running-using-docker)
- [Start Up and Running for E2E Tests](#start-up-and-running-for-e2e-tests)
- [Manually Start Up and Running Wenex](#manually-start-up-and-running-wenex)

## Add Remote (Optional)

```sh
npm run git:remote:add staging example.com
```

> Note: stage must be `staging` or `production`.

## Start Essential Utilities

```sh
docker-compose -f docker/docker-compose.yml up -d
# The other `yml` files in `docker` directory are optional
```

## DB Seeding and Initialization

- [Using Docker](#using-docker)
- [For E2E Tests](#for-e2e-tests)
- [Manual Seeding](#manual-seeding)

### Using Docker

> Note: run `docker build -t wenex/platform:latest .` before using docker solution.

```sh
# MongoDB
docker-compose --profile db-seed up

# Elasticsearch
docker-compose --profile db-index up

# Clean All Database
# docker-compose --profile db-clean up

# MinIO Initialization
docker-compose --profile storage-init up

# Set EMQX Configuration
docker-compose --profile utility-init up
```

### For E2E Tests

```sh
# MongoDB
npm run db:seed:e2e

# Elasticsearch
npm run db:index:e2e

# Clean All Database
# npm run db:clean:e2e

# MinIO Initialization
npm run storage-init

# Set EMQX Configuration
npm run utility-init
```

### Manual Seeding

```sh
# MongoDB
npm run db:seed

# Elasticsearch
npm run db:index

# Clean All Database
# npm run db:clean

# MinIO Initialization
npm run storage-init

# Set EMQX Configuration
npm run utility-init
```

## Start Up and Running using Docker

> Note: run `docker build -t wenex/platform:latest .` before using docker solution.

Start all services at once, `gateway` and the other services

```sh
docker-compose --profile services up -d
```

> Note: to start workers need to configure `kafka-connect` with the following command.

```sh
docker-compose --profile kafka-connect up
```

Start all workers using the following command

```sh
docker-compose --profile workers up -d
```

## Start Up and Running for E2E Tests

Open one of the `kgx` or `gnome-terminal` terminal and run the following command in the `platform` directory

```sh
# Specify the services in order that you want to start
npm run script:start:e2e auth domain context gateway ...
```

Before running the workers and after running services you should config the `kafka-connect` using the following command

```sh
npm run script:kafka-connect:e2e
```

Start the workers using the previously `npm run script:start:e2e watcher observer ...` npm script command

## Manually Start Up and Running Wenex

Start each service you want using the following command

```sh
npm run start:dev <services-name>
# npm run start:debug[2] <services-name>
```

Configure `kafka-connect` with the following command

```sh
npm run script:kafka-connect
```

Start the workers using the previously used command to starting services.
