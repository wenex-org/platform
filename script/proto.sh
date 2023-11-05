#!/bin/bash

declare -A PROTOS

# Protos
DOMAIN=./proto/domain.proto
IDENTITY=./proto/identity.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/modules/identity/identity.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"DOMAIN"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $DOMAIN ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"IDENTITY"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $IDENTITY ${PROTOS[$KEY]}; fi
  fi
done
