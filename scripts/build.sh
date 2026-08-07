#!/bin/bash

pnpm run build gateway

######################
# Build services
######################

services=("auth" "context" "domain" "essential")
for service in "${services[@]}"; do
  pnpm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("financial" "general" "identity" "special")
for service in "${services[@]}"; do
  pnpm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("touch" "content" "logistic" "conjoint")
for service in "${services[@]}"; do
  pnpm run build "$service" &
done

# Wait for all background jobs to complete
wait

services=("career" "thing")
for service in "${services[@]}"; do
  pnpm run build "$service" &
done

# Wait for all background jobs to complete
wait

######################
# Build workers
######################

workers=("watcher" "preserver" "observer" "dispatcher")
for worker in "${workers[@]}"; do
  pnpm run build "$worker" &
done

# Wait for all background jobs to complete
wait

workers=("publisher" "logger" "cleaner")
for worker in "${workers[@]}"; do
  pnpm run build "$worker" &
done

# Wait for all background jobs to complete
wait && cp -a dist wnx
