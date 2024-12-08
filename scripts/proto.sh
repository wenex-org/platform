#!/bin/bash

declare -A PROTOS

# Protos
AUTH=./protos/auth.proto

# Auth Proto
PROTOS[AUTH,1]=./apps/services/auth/src/app.proto

# Main Program
for KEY in "${!PROTOS[@]}"; do
  if [[ $KEY == *"AUTH"* ]]; then ln -f $AUTH ${PROTOS[$KEY]}; fi
done
