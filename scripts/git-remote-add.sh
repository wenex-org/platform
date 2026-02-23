STAGE=$1
DOMAIN=$2

# Check if STAGE is valid
if [[ "$STAGE" != "staging" && "$STAGE" != "production" ]]; then
  echo "Error: STAGE must be 'staging' or 'production'."
  exit 1
fi

# Check if DOMAIN is a valid FQDN
if ! [[ "$DOMAIN" =~ ^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$ ]]; then
  echo "Error: DOMAIN must be a valid FQDN (e.g., wenex.org)."
  exit 1
fi

# Check if the current branch is main
echo "Checking out to main branch..."
npm run git checkout main && echo ""

git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform."
else
  git push "$STAGE" main
  echo "Remote repository for platform added successfully."
fi

# Navigate to the apps/services directory of the project
cd "apps/services"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform-services.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform-services."
else
  git push "$STAGE" main
  echo "Remote repository for platform-services added successfully."
fi

# Navigate to the apps/workers directory of the project
cd "../workers"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform-workers.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform-workers."
else
  git push "$STAGE" main
  echo "Remote repository for platform-workers added successfully."
fi

# Navigate to the docker directory of the project
cd "../../docker"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform-docker.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform-docker."
else
  git push "$STAGE" main
  echo "Remote repository for platform-docker added successfully."
fi

# Navigate to the libs directory of the project
cd "../libs"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform-libs.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform-libs."
else
  git push "$STAGE" main
  echo "Remote repository for platform-libs added successfully."
fi

# Navigate to the protos directory of the project
cd "../protos"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/platform-protos.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for platform-protos."
else
  git push "$STAGE" main
  echo "Remote repository for platform-protos added successfully."
fi
