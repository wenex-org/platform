#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./protos/auth.proto
DOMAIN=./protos/domain.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/protobuf/auth.proto
PROTOS[AUTH,3]=./libs/common/src/providers/auth/protobuf/auth.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/protobuf/domain.proto
PROTOS[DOMAIN,3]=./libs/common/src/providers/domain/protobuf/domain.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"DOMAIN"* ]]; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
done
