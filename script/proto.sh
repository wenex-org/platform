#!/bin/bash

declare -A PROTOS

# Protos
IDENTITY=./proto/identity.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/modules/identity/identity.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"IDENTITY"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln $IDENTITY ${PROTOS[$KEY]}; fi
  fi
done
