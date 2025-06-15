#!/bin/bash

if [[ -z "$CI_STAGE" ]]; then
  echo "Error: CI_STAGE environment variable is not set. It must be either 'staging' or 'production'."
  exit 1
fi

if [[ "$CI_STAGE" != "staging" && "$CI_STAGE" != "production" ]]; then
  echo "Error: CI_STAGE must be either 'staging' or 'production'."
  exit 1
fi

echo "CI_STAGE is set to '$CI_STAGE'. Proceeding with setup..."

# Sonarqube
bash ./scripts/ci/sonar.sh
if [ $? == 0 ]; then echo -e "Sonarqube prepared successfully.\n"
else echo -e "Preparing sonarqube was failed...!\n" && exit 1; fi
