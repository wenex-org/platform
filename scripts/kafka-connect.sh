if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

MONGO_SOURCE="mongo-source"

MONGO_SOURCE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" localhost:8082/connectors/$MONGO_SOURCE)

if [ $MONGO_SOURCE_EXISTS -eq 200 ]; then
  curl -X DELETE localhost:8082/connectors/$MONGO_SOURCE
fi


curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" localhost:8082/connectors/ -d "{
  \"name\": \"$MONGO_SOURCE\",
  \"config\": {
    \"connector.class\": \"io.debezium.connector.mongodb.MongoDbConnector\",
    \"mongodb.connection.string\": \"mongodb://$MONGO_USER:$MONGO_PASS@$MONGO_HOST/?$MONGO_QUERY\",
    \"topic.prefix\": \"mongo\",
    \"capture.mode\": \"change_streams_update_full_with_pre_image\",
    \"collection.include.list\": \"$MONGO_PREFIX.*\"
  }
}"