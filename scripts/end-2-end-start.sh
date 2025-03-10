#!/bin/bash

mkdir -p logs
declare -A JOBS

npm run db:clean:e2e && npm run db:seed:e2e

# Start services and capture PIDs
services=("auth" "context" "domain" "essential" "financial" "identity" "special" "touch" "gateway")
for service in "${services[@]}"; do
  npm run start:dev:e2e "$service" 2> "logs/$service.log" &
  JOBS[$service]=$!
  echo "Started $service with PID: ${JOBS[$service]}"
done

echo "Waiting for services to start..."
sleep 90

npm run script:kafka-connect:e2e

# Start additional services
additional_services=("watcher" "preserver" "observer" "dispatcher")
for service in "${additional_services[@]}"; do
  npm run start:dev:e2e "$service" 2> "logs/$service.log" &
  JOBS[$service]=$!
  echo "Started $service with PID: ${JOBS[$service]}"
done

echo "Waiting for workers to start..."
sleep 60
echo "All services started successfully!"
