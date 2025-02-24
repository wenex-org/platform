#!/bin/bash

SERVICE_NAME=${1:-gateway}

if [ $SERVICE_NAME == "gateway" ]; then
  node dist/apps/gateway/main.js
else
  if [ -d "dist/apps/services/$SERVICE_NAME" ]; then
    node dist/apps/services/$SERVICE_NAME/main.js
  elif [ -d "dist/apps/workers/$SERVICE_NAME" ]; then
    node dist/apps/workers/$SERVICE_NAME/main.js
  else
    echo -e "Service or Worker not found...!\n" && exit 1
  fi
fi
