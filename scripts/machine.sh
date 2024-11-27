#!/bin/bash

# Path to the .env file
ENV_FILE=".env"

# Section to check
SECTION="# ----------------------------------------\n# AUTOMATICALLY GENERATED (DO NOT MODIFY)\n# ----------------------------------------"

# Generate a random MACHINE_ID value
RANDOM_ID=$(cat /dev/urandom | head -c 15 | base32)

# Check if the file ends with the section and the MACHINE_ID variable
if ! tail -n 4 "$ENV_FILE" 2>/dev/null | grep -q "MACHINE_ID="; then
  echo -e "\n$SECTION\n\nMACHINE_ID=$RANDOM_ID" >> "$ENV_FILE"
  echo "Section and MACHINE_ID added to the .env file."
else
  echo "The section with MACHINE_ID already exists at the end of the file."
fi
