if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" localhost:8082/connectors/ -d "{
  "name": "mongo-source",
  "config": {
    "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
    "mongodb.connection.string": "mongodb://$MONGO_USER:$MONGO_PASS@$MONGO_HOST/?$MONGO_QUERY",
    "topic.prefix": "mongo",
    "collection.include.list": "$MONGO_DB.\*"
  }
}"