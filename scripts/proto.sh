#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./protos/auth.proto
CONTEXT=./protos/context.proto
DOMAIN=./protos/domain.proto
ESSENTIAL=./protos/essential.proto
IDENTITY=./protos/identity.proto
SPECIAL=./protos/special.proto

PRESERVER=./protos/workers/preserver.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/protobuf/auth.proto
PROTOS[AUTH,3]=./apps/workers/preserver/src/protobuf/auth.proto
PROTOS[AUTH,4]=./libs/common/src/providers/auth/protobuf/auth.proto

# Context Proto
PROTOS[CONTEXT,1]=./apps/services/context/src/app.proto
PROTOS[CONTEXT,2]=./apps/gateway/src/protobuf/context.proto
PROTOS[CONTEXT,3]=./libs/common/src/providers/context/protobuf/context.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/protobuf/domain.proto
PROTOS[DOMAIN,3]=./apps/services/auth/src/protobuf/domain.proto
PROTOS[DOMAIN,4]=./libs/common/src/providers/domain/protobuf/domain.proto

# Essential Proto
PROTOS[ESSENTIAL,1]=./apps/services/essential/src/app.proto
PROTOS[ESSENTIAL,2]=./apps/gateway/src/protobuf/essential.proto
PROTOS[ESSENTIAL,3]=./apps/services/auth/src/protobuf/essential.proto
PROTOS[ESSENTIAL,4]=./apps/services/domain/src/protobuf/essential.proto
PROTOS[ESSENTIAL,5]=./apps/services/context/src/protobuf/essential.proto
PROTOS[ESSENTIAL,6]=./apps/services/special/src/protobuf/essential.proto
PROTOS[ESSENTIAL,7]=./apps/services/identity/src/protobuf/essential.proto
PROTOS[ESSENTIAL,8]=./libs/common/src/providers/essential/protobuf/essential.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/protobuf/identity.proto
PROTOS[IDENTITY,3]=./apps/services/auth/src/protobuf/identity.proto
PROTOS[IDENTITY,4]=./libs/common/src/providers/identity/protobuf/identity.proto

# Special Proto
PROTOS[SPECIAL,1]=./apps/services/special/src/app.proto
PROTOS[SPECIAL,2]=./apps/gateway/src/protobuf/special.proto
PROTOS[SPECIAL,3]=./libs/common/src/providers/special/protobuf/special.proto

# Preserver Proto
PROTOS[PRESERVER,1]=./apps/workers/preserver/src/app.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONTEXT"* ]]; then ln -f $CONTEXT ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"DOMAIN"* ]]; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"ESSENTIAL"* ]]; then ln -f $ESSENTIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"IDENTITY"* ]]; then ln -f $IDENTITY ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"SPECIAL"* ]]; then ln -f $SPECIAL ${PROTOS[$KEY]}; fi

  if [[ $KEY == *"PRESERVER"* ]]; then ln -f $PRESERVER ${PROTOS[$KEY]}; fi
done
