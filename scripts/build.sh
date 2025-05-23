#!/bin/bash

npm run build gateway

# Build services
services=("auth" "content" "context" "domain" "essential")
for service in "${services[@]}"; do
  npm run build "$service" &
done

services=("financial" "general" "identity" "special" "touch")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait

# Build workers
workers=("watcher" "preserver" "observer" "dispatcher")
for worker in "${workers[@]}"; do
  npm run build "$worker" &
done

# Wait for all background jobs to complete
wait
