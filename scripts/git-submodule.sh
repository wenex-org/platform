#!/bin/bash

git submodule foreach git $1 $2 $3 $4 $5 $6 $7 $8 $9
git $1 $2 $3 $4 $5 $6 $7 $8 $9

if [ $1 = "flow" ] && { [ $2 = "release" ] || [ $2 = "hotfix" ]; } && [ $3 = "finish" ]; then
  git submodule foreach git push origin --tags
  git push origin --tags
fi
