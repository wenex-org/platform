DB_PREFIX="$MONGO_PREFIX"

if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | grep -v '^$' | xargs)
fi

if [ -n "$DB_PREFIX" ]; then
  MONGO_PREFIX="$DB_PREFIX"
else
  MONGO_PREFIX="$MONGO_PREFIX"
fi

MONGO_SOURCE="$MONGO_PREFIX-mongo-source"

CONNECT_PORT=${CONNECT_PORT:-8082}
CONNECT_HOST=${CONNECT_HOST:-localhost}

MONGO_SOURCE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $CONNECT_HOST:$CONNECT_PORT/connectors/$MONGO_SOURCE)

if [ $MONGO_SOURCE_EXISTS -eq 200 ]; then
  curl -X DELETE $CONNECT_HOST:$CONNECT_PORT/connectors/$MONGO_SOURCE
fi

MONGO_PREFIX=${1:-$MONGO_PREFIX}
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" $CONNECT_HOST:$CONNECT_PORT/connectors/ -d "{
  \"name\": \"$MONGO_SOURCE\",
  \"config\": {
    \"connector.class\": \"io.debezium.connector.mongodb.MongoDbConnector\",
    \"mongodb.connection.string\": \"mongodb://$MONGO_USER:$MONGO_PASS@$MONGO_HOST/?$MONGO_QUERY\",
    \"topic.prefix\": \"mongo\",
    \"capture.mode\": \"change_streams_update_full_with_pre_image\",
    \"collection.include.list\": \"$MONGO_PREFIX.*\"
  }
}"