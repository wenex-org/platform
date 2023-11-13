# Wenex - Platform

- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Up & Running](#up--running)
- [Deployment](#deployment)
  - [Production](#production)
- [Documentation](#documentation)

## Quick Start

This guide section is prepared to start the platform for development purposes, production recommendations were ready in the [Deployment / Production](#production) section.

The platform consists of four main projects:

1. Platform: prepares the main functionality of the application (authentication, access control, etc.) over `Restful` and `GraphQL` gateway.
2. Platform SDK: this is an npm package to simplify working with the core functionality of platform types and services in the front-end and back-end of the client.
3. Client Backend: this project communicates with the old project and old database to emigrate from `PHP` to `NodeJS`, and also contains some logic of the old project.
4. Client Frontend: web-based user interface written in the `VueJS` for administration purposes and supporting solutions.

### Prerequisites

Docker with compose and node `>=18.x.x` shipped with npm needs to be installed. to start and run mandatory tools with the docker-compose enter the following command in your terminal `docker-compose -f compose/docker-compose.utils.yml up -d` this command will up and run the `mongodb` and `redis` used by the platform.

### Up & Running

Gateway equipped with Swagger OpenAPIv3 documentation and Apollo GraphQL Playground. most services communicate with `GRPC` protocol except the touch service which uses `RabbitMQ`.

```sh
# clone the platform repository
git clone git@gitlab.com:coinoverse-back-end/admin-platform.git

# install dependencies with pnpm
cd admin-platform && pnpm install --frozen-lockfile

# environmental variable
cp ./.env.example ./.env

# prepare the assets
npm run script:setup

# Seeding database
npm run db:seed

# command to start gateway
npm run start gateway &

# command to start other services
npm run start platform/auth & \
npm run start platform/domain & \
npm run start platform/identity &

# command to start touch service (email)
npm run start platform/touch
```

> Note: Each service has it's own health check and metrics endpoint and also it's own sentry issue tracker.

## Deployment

The docker file is ready at the root project directory with the docker-compose file.

### Production

In production mode project will start the tracing functionality with the open telemetry. the Zipkin, Jeager and Otelcol tools exist in the `compose` directory.

> Note: Define persist volume for your databases in yaml files, change the `NODE_ENV` environment value to `production`.

## Documentation

This project was documented with the [C4](https://c4model.com/) model to see diagrams of context and container you've to need the [structurizr](https://structurizr.com/), to start and run the `structurizr` enter `docker-compose -f compose/docker-compose.strct.yml up -d` command in your terminal then go to the [http://127.0.0.1:8080](http://127.0.0.1:8080)

To automatically generate component diagrams start the command `npm run doc` and discover it on [http://127.0.0.1:8088](http://127.0.0.1:8088), or use it offline at the `file://./docs/index.html`
