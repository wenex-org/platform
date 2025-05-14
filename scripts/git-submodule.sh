#!/bin/bash

git submodule foreach git "$@"
git "$@"

if [ $1 = "flow" ] && { [ $2 = "release" ] || [ $2 = "hotfix" ]; } && [ $3 = "finish" ]; then
  git submodule foreach git push origin --tags
  git push origin --tags
fi
