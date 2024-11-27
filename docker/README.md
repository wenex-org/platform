# Docker

Start all container needs by `docker-compose -f docker/docker-compose.yml up -d` command.

- [MongoDB](#mongodb)

## MongoDB

```sh
docker-compose -f docker/docker-compose.mg.yml up -d
```

Add these lines to `/etc/hosts`:

```sh
127.0.0.1 mongodb-primary
127.0.0.1 mongodb-secondary
```

> Connection URL: `mongodb://root:password123@mongodb-primary:27017,mongodb-secondary:27018/?replicaSet=rs0&authSource=admin`
