#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./proto/auth.proto
TOUCH=./proto/touch.proto
CONFIG=./proto/config.proto
DOMAIN=./proto/domain.proto
SPECIAL=./proto/special.proto
IDENTITY=./proto/identity.proto
FINANCIAL=./proto/financial.proto

PRESERVER=./proto/workers/preserver.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/modules/auth/auth.proto

# Touch Proto
PROTOS[TOUCH,1]=./apps/services/touch/src/app.proto

# Config Proto
PROTOS[CONFIG,1]=./apps/services/config/src/app.proto
PROTOS[CONFIG,2]=./apps/gateway/src/modules/config/config.proto
PROTOS[CONFIG,3]=./apps/services/auth/src/protobuf/config.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/modules/domain/domain.proto
PROTOS[DOMAIN,3]=./apps/services/auth/src/protobuf/domain.proto
PROTOS[DOMAIN,4]=./apps/services/touch/src/protobuf/domain.proto

# Special Proto
PROTOS[SPECIAL,1]=./apps/services/special/src/app.proto
PROTOS[SPECIAL,3]=./apps/services/touch/src/protobuf/special.proto
PROTOS[SPECIAL,2]=./apps/services/identity/src/protobuf/special.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/services/auth/src/protobuf/identity.proto
PROTOS[IDENTITY,3]=./apps/gateway/src/modules/identity/identity.proto
PROTOS[IDENTITY,4]=./apps/workers/preserver/src/protobuf/identity.proto

# Financial Proto
PROTOS[FINANCIAL,1]=./apps/services/financial/src/app.proto

# Preserver Proto
PROTOS[PRESERVER,1]=./apps/workers/preserver/src/app.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"TOUCH"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $TOUCH ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"CONFIG"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $CONFIG ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"DOMAIN"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"SPECIAL"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $SPECIAL ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"IDENTITY"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $IDENTITY ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"FINANCIAL"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $FINANCIAL ${PROTOS[$KEY]}; fi
  fi
  if [[ $KEY == *"PRESERVER"* ]]; then
    if ! test -f ${PROTOS[$KEY]}; then ln -f $PRESERVER ${PROTOS[$KEY]}; fi
  fi
done
