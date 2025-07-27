#!/bin/bash

npm run build gateway

# Build services
services=("auth" "context" "domain" "essential")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("financial" "general" "identity" "special")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("touch" "content" "logistic")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("conjoint" "career")
for service in "${services[@]}"; do
  npm run build "$service" &
done

# Wait for all background jobs to complete
wait

# Build workers
workers=("watcher" "preserver" "observer")
for worker in "${workers[@]}"; do
  npm run build "$worker" &
done

# Wait for all background jobs to complete
wait

# Build workers
workers=("dispatcher" "publisher")
for worker in "${workers[@]}"; do
  npm run build "$worker" &
done

# Wait for all background jobs to complete
wait
