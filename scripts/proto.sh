#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./protos/auth.proto
CONTEXT=./protos/context.proto
DOMAIN=./protos/domain.proto
ESSENTIAL=./protos/essential.proto
FINANCIAL=./protos/financial.proto
GENERAL=./protos/general.proto
IDENTITY=./protos/identity.proto
SPECIAL=./protos/special.proto
TOUCH=./protos/touch.proto
CONTENT=./protos/content.proto
LOGISTIC=./protos/logistic.proto
CONJOINT=./protos/conjoint.proto
CAREER=./protos/career.proto

PRESERVER=./protos/workers/preserver.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto
PROTOS[AUTH,2]=./apps/gateway/src/protobuf/auth.proto
PROTOS[AUTH,3]=./apps/workers/preserver/src/protobuf/auth.proto
PROTOS[AUTH,4]=./libs/common/src/providers/auth/protobuf/auth.proto
PROTOS[AUTH,5]=./apps/services/domain/src/protobuf/auth.proto

# Context Proto
PROTOS[CONTEXT,1]=./apps/services/context/src/app.proto
PROTOS[CONTEXT,2]=./apps/gateway/src/protobuf/context.proto
PROTOS[CONTEXT,3]=./libs/common/src/providers/context/protobuf/context.proto

# Domain Proto
PROTOS[DOMAIN,1]=./apps/services/domain/src/app.proto
PROTOS[DOMAIN,2]=./apps/gateway/src/protobuf/domain.proto
PROTOS[DOMAIN,3]=./apps/services/auth/src/protobuf/domain.proto
PROTOS[DOMAIN,4]=./apps/services/touch/src/protobuf/domain.proto
PROTOS[DOMAIN,5]=./libs/common/src/providers/domain/protobuf/domain.proto

# Essential Proto
PROTOS[ESSENTIAL,1]=./apps/services/essential/src/app.proto
PROTOS[ESSENTIAL,2]=./apps/gateway/src/protobuf/essential.proto
PROTOS[ESSENTIAL,3]=./apps/services/auth/src/protobuf/essential.proto
PROTOS[ESSENTIAL,4]=./apps/services/touch/src/protobuf/essential.proto
PROTOS[ESSENTIAL,5]=./apps/services/domain/src/protobuf/essential.proto
PROTOS[ESSENTIAL,6]=./apps/services/career/src/protobuf/essential.proto
PROTOS[ESSENTIAL,7]=./apps/services/context/src/protobuf/essential.proto
PROTOS[ESSENTIAL,8]=./apps/services/content/src/protobuf/essential.proto
PROTOS[ESSENTIAL,9]=./apps/services/special/src/protobuf/essential.proto
PROTOS[ESSENTIAL,A]=./apps/services/general/src/protobuf/essential.proto
PROTOS[ESSENTIAL,B]=./apps/services/identity/src/protobuf/essential.proto
PROTOS[ESSENTIAL,C]=./apps/services/logistic/src/protobuf/essential.proto
PROTOS[ESSENTIAL,D]=./apps/services/conjoint/src/protobuf/essential.proto
PROTOS[ESSENTIAL,E]=./apps/services/financial/src/protobuf/essential.proto
PROTOS[ESSENTIAL,F]=./libs/common/src/providers/essential/protobuf/essential.proto

# Financial Proto
PROTOS[FINANCIAL,1]=./apps/services/financial/src/app.proto
PROTOS[FINANCIAL,2]=./apps/gateway/src/protobuf/financial.proto
PROTOS[FINANCIAL,3]=./libs/common/src/providers/financial/protobuf/financial.proto

# General Proto
PROTOS[GENERAL,1]=./apps/services/general/src/app.proto
PROTOS[GENERAL,2]=./apps/gateway/src/protobuf/general.proto
PROTOS[GENERAL,3]=./libs/common/src/providers/general/protobuf/general.proto

# Identity Proto
PROTOS[IDENTITY,1]=./apps/services/identity/src/app.proto
PROTOS[IDENTITY,2]=./apps/gateway/src/protobuf/identity.proto
PROTOS[IDENTITY,3]=./apps/services/auth/src/protobuf/identity.proto
PROTOS[IDENTITY,4]=./libs/common/src/providers/identity/protobuf/identity.proto

# Special Proto
PROTOS[SPECIAL,1]=./apps/services/special/src/app.proto
PROTOS[SPECIAL,2]=./apps/gateway/src/protobuf/special.proto
PROTOS[SPECIAL,3]=./apps/services/touch/src/protobuf/special.proto
PROTOS[SPECIAL,4]=./apps/services/logistic/src/protobuf/special.proto
PROTOS[SPECIAL,5]=./apps/services/financial/src/protobuf/special.proto
PROTOS[SPECIAL,6]=./libs/common/src/providers/special/protobuf/special.proto

# Touch Proto
PROTOS[TOUCH,1]=./apps/services/touch/src/app.proto
PROTOS[TOUCH,2]=./apps/gateway/src/protobuf/touch.proto
PROTOS[TOUCH,3]=./libs/common/src/providers/touch/protobuf/touch.proto

# Content Proto
PROTOS[CONTENT,1]=./apps/services/content/src/app.proto
PROTOS[CONTENT,2]=./apps/gateway/src/protobuf/content.proto
PROTOS[CONTENT,3]=./libs/common/src/providers/content/protobuf/content.proto

# Logistic Proto
PROTOS[LOGISTIC,1]=./apps/services/logistic/src/app.proto
PROTOS[LOGISTIC,2]=./apps/gateway/src/protobuf/logistic.proto
PROTOS[LOGISTIC,3]=./libs/common/src/providers/logistic/protobuf/logistic.proto

# Conjoint Proto
PROTOS[CONJOINT,1]=./apps/services/conjoint/src/app.proto
PROTOS[CONJOINT,2]=./apps/gateway/src/protobuf/conjoint.proto
PROTOS[CONJOINT,3]=./libs/common/src/providers/conjoint/protobuf/conjoint.proto

# Career Proto
PROTOS[CAREER,1]=./apps/services/career/src/app.proto
PROTOS[CAREER,2]=./apps/gateway/src/protobuf/career.proto
PROTOS[CAREER,3]=./libs/common/src/providers/career/protobuf/career.proto

# Preserver Proto
PROTOS[PRESERVER,1]=./apps/workers/preserver/src/app.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONTEXT"* ]]; then ln -f $CONTEXT ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"DOMAIN"* ]]; then ln -f $DOMAIN ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"ESSENTIAL"* ]]; then ln -f $ESSENTIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"FINANCIAL"* ]]; then ln -f $FINANCIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"GENERAL"* ]]; then ln -f $GENERAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"IDENTITY"* ]]; then ln -f $IDENTITY ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"SPECIAL"* ]]; then ln -f $SPECIAL ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"TOUCH"* ]]; then ln -f $TOUCH ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONTENT"* ]]; then ln -f $CONTENT ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"LOGISTIC"* ]]; then ln -f $LOGISTIC ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CONJOINT"* ]]; then ln -f $CONJOINT ${PROTOS[$KEY]}; fi
  if [[ $KEY == *"CAREER"* ]]; then ln -f $CAREER ${PROTOS[$KEY]}; fi

  if [[ $KEY == *"PRESERVER"* ]]; then ln -f $PRESERVER ${PROTOS[$KEY]}; fi
done
