# How To Run Wenex Platform

## clone project
```sh
git clone https://github.com/wenex-org/platform.git
```
Get platform submodules:
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

### 3. Set Up Kafka Cluster

Initialize the Kafka cluster:

```sh
npm run script:kafka-connect
```

### 4. Clean and Seed Database

Initialize EMQX and MinIO, then clean and seed the database:

```sh
npm run db:clean && npm run db:seed
npm run storage:init && npm run utility:init
```

### 5. Run Microservices

Start the microservices in development mode:

```sh
npm run start:dev auth
npm run start:dev context
npm run start:dev identity
npm run start:dev domain
npm run start:dev essential
npm run start:dev financial
npm run start:dev special
npm run start:dev general
npm run start:dev touch
npm run start:dev gateway
```

```sh
npm run start:dev watcher
npm run start:dev preserver
npm run start:dev observer
npm run start:dev dispatcher
```


## Notes

- Ensure Docker is running before starting the services.
