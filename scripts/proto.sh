#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./protos/auth.proto
DOMAIN=./protos/domain.proto
CONTEXT=./protos/context.proto
IDENTITY=./protos/identity.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/protobuf/auth.proto
PROTOS[AUTH,3]=./libs/common/src/providers/auth/protobuf/auth.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/protobuf/domain.proto
PROTOS[DOMAIN,3]=./libs/common/src/providers/domain/protobuf/domain.proto

# Context Proto
PROTOS[CONTEXT,1]=./apps/services/context/src/app.proto
PROTOS[CONTEXT,2]=./apps/gateway/src/protobuf/context.proto
PROTOS[CONTEXT,3]=./libs/common/src/providers/context/protobuf/context.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/protobuf/identity.proto
PROTOS[IDENTITY,3]=./libs/common/src/providers/identity/protobuf/identity.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"DOMAIN"* ]]; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONTEXT"* ]]; then ln -f $CONTEXT ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"IDENTITY"* ]]; then ln -f $IDENTITY ${PROTOS[$KEY]}; fi
done
