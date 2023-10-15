#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./proto/auth.proto
DOMAIN=./proto/domain.proto
IDENTITY=./proto/identity.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/platform/auth/src/proto/auth.proto
PROTOS[AUTH,2]=./apps/gateway/src/platform/auth/proto/auth.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/platform/domain/src/proto/domain.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/platform/domain/proto/domain.proto
PROTOS[DOMAIN,3]=./apps/platform/auth/src/crafts/authentication/proto/domain.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/platform/identity/src/proto/identity.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/platform/identity/proto/identity.proto
PROTOS[IDENTITY,3]=./apps/platform/auth/src/crafts/authentication/proto/identity.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $AUTH ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"DOMAIN"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $DOMAIN ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"IDENTITY"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $IDENTITY ${PROTOS[$KEY]}; fi
  fi
done
