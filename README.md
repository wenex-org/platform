# Platform

## clone project

```sh
npm run git:clone
```

## Installation

### 1. Install Dependencies

Ensure you have [pnpm](https://pnpm.io/) installed, then run:

```sh
pnpm install
```

### 2. Start Docker Containers

Download and run the required Docker containers:

```sh
docker-compose -f docker/docker-compose.yml up -d
```

### 3. Run Microservices

Start the microservices in development mode:

```sh
npm run start:dev gateway
npm run start:dev auth
npm run start:dev context
npm run start:dev identity
npm run start:dev touch
npm run start:dev watcher
npm run start:dev preserver
npm run start:dev observer
npm run start:dev dispatcher
```

### 4. Set Up Kafka Cluster

Initialize the Kafka cluster:

```sh
npm run script:kafka-connect
```

### 5. Clean and Seed Database

Initialize EMQX and MinIO, then clean and seed the database:

```sh
npm run db:clean && npm run db:seed
npm run storage:init && npm run utility:init
```

## Notes

- Ensure Docker is running before starting the services.
