#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./proto/auth.proto
CONFIG=./proto/config.proto
DOMAIN=./proto/domain.proto
IDENTITY=./proto/identity.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/modules/auth/auth.proto

# Config Proto
PROTOS[CONFIG,1]=./apps/services/config/src/app.proto
PROTOS[CONFIG,2]=./apps/gateway/src/modules/config/config.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/modules/domain/domain.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/modules/identity/identity.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $AUTH ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"CONFIG"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $CONFIG ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"DOMAIN"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $DOMAIN ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"IDENTITY"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $IDENTITY ${PROTOS[$KEY]}; fi
  fi
done
