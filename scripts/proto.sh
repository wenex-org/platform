#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./proto/auth.proto
TOUCH=./proto/touch.proto
CONFIG=./proto/config.proto
DOMAIN=./proto/domain.proto
SPECIAL=./proto/special.proto
GENERAL=./proto/general.proto
IDENTITY=./proto/identity.proto
LOGISTIC=./proto/logistic.proto
FINANCIAL=./proto/financial.proto

PRESERVER=./proto/workers/preserver.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/protobuf/auth.proto

# Touch Proto
PROTOS[TOUCH,1]=./apps/services/touch/src/app.proto
PROTOS[TOUCH,2]=./apps/gateway/src/protobuf/touch.proto

# Config Proto
PROTOS[CONFIG,1]=./apps/services/config/src/app.proto
PROTOS[CONFIG,2]=./apps/gateway/src/protobuf/config.proto
PROTOS[CONFIG,3]=./apps/services/auth/src/protobuf/config.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/protobuf/domain.proto
PROTOS[DOMAIN,3]=./apps/services/auth/src/protobuf/domain.proto
PROTOS[DOMAIN,4]=./apps/services/touch/src/protobuf/domain.proto

# Special Proto
PROTOS[SPECIAL,1]=./apps/services/special/src/app.proto
PROTOS[SPECIAL,2]=./apps/gateway/src/protobuf/special.proto
PROTOS[SPECIAL,3]=./apps/services/auth/src/protobuf/special.proto
PROTOS[SPECIAL,4]=./apps/services/touch/src/protobuf/special.proto
PROTOS[SPECIAL,5]=./apps/services/identity/src/protobuf/special.proto

# General Proto
PROTOS[GENERAL,1]=./apps/services/general/src/app.proto
PROTOS[GENERAL,2]=./apps/gateway/src/protobuf/general.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/protobuf/identity.proto
PROTOS[IDENTITY,3]=./apps/services/auth/src/protobuf/identity.proto
PROTOS[IDENTITY,4]=./apps/workers/preserver/src/protobuf/identity.proto

# Logistic Proto
PROTOS[LOGISTIC,1]=./apps/services/logistic/src/app.proto
PROTOS[LOGISTIC,2]=./apps/gateway/src/protobuf/logistic.proto

# Financial Proto
PROTOS[FINANCIAL,1]=./apps/services/financial/src/app.proto
PROTOS[FINANCIAL,2]=./apps/gateway/src/protobuf/financial.proto

# Preserver Proto
PROTOS[PRESERVER,1]=./apps/workers/preserver/src/app.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"TOUCH"* ]]; then ln -f $TOUCH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONFIG"* ]]; then ln -f $CONFIG ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"DOMAIN"* ]]; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"SPECIAL"* ]]; then ln -f $SPECIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"GENERAL"* ]]; then ln -f $GENERAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"IDENTITY"* ]]; then ln -f $IDENTITY ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"LOGISTIC"* ]]; then ln -f $LOGISTIC ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"FINANCIAL"* ]]; then ln -f $FINANCIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"PRESERVER"* ]]; then ln -f $PRESERVER ${PROTOS[$KEY]}; fi
done
