#!/bin/bash

if [ -z "$SONAR_PROJECT_KEY" ]; then
  echo "Error: SONAR_PROJECT_KEY is not set. Please set it in your environment variables."
  exit 1
fi

sed -i "s/^sonar\.projectKey=.*/sonar.projectKey=${SONAR_PROJECT_KEY}/" sonar-project.properties
