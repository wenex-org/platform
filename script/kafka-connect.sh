curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" localhost:8082/connectors/ -d '{
  "name": "mongo-source",
  "config": {
    "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
    "mongodb.connection.string": "mongodb://root:password123@mongodb-primary:27017,mongodb-secondary:27018,mongodb-arbiter:27019/?replicaSet=rs0&authSource=admin",
    "topic.prefix": "mongo",
    "collection.include.list": "wenex.*"
  }
}'