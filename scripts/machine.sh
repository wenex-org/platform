#!/bin/bash

# Path to the .env file
ENV_FILE=".env"

# Section to check
SECTION="# ----------------------------------------\n# AUTOMATICALLY GENERATED (DO NOT MODIFY)\n# ----------------------------------------"

# Generate a random MACHINE_ID value
RANDOM_ID=$(head -c 15 /dev/urandom | base32)

# Check if the file ends with the section and the MACHINE_ID variable
if ! tail -n 4 "$ENV_FILE" 2>/dev/null | grep -q "MACHINE_ID=[^ ]"; then
  if grep -q "MACHINE_ID=$" "$ENV_FILE"; then
    sed -i "s/MACHINE_ID=$/MACHINE_ID=$RANDOM_ID/" "$ENV_FILE"
    echo "Empty MACHINE_ID filled in the .env file."
  else
    echo -e "\n$SECTION\n\nMACHINE_ID=$RANDOM_ID" >> "$ENV_FILE"
    echo "Section and MACHINE_ID added to the .env file."
  fi
else
  echo "The section with MACHINE_ID already exists at the end of the file."
fi
