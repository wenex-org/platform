#!/bin/bash

mkdir -p logs

shell=${SHELL:-/bin/bash}
if [ -z "$shell" ]; then
  echo "ERROR: No suitable shell found. Please install zsh or bash."
  exit 1
fi

terminal=$(command -v kgx)
if [ -z "$terminal" ]; then
  terminal=$(command -v gnome-terminal)
  if [ -z "$terminal" ]; then
    echo "WARN: No suitable terminal found. Please install kgx or gnome-terminal."
  fi
fi

services=($(echo $@ | tr ',' ' '))

for service in "${services[@]}"; do
  if [ -z "$terminal" ]; then
    npm run start:dev:e2e "$service" 2> "logs/$service.log" &
  else
    $terminal --tab --title="$service" -- "$shell" -c "npm run start:dev:e2e $service" &
  fi
  sleep 15
done

sleep 30
echo "All services started successfully!"
