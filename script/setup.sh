#!/bin/bash

######################
# Assets Preparation #
######################

# Proto
sh ./script/proto.sh
if [ $? == 0 ]; then echo -e "Proto prepared successfully.\n\n"
else echo -e "\n\nPreparing proto assets was failed...!"; fi

# Kafka Connect
sh ./script/kafka-connect.sh
if [ $? == 0 ]; then echo -e "\n\nKafka-Connect prepared successfully."
else echo -e "\n\nPreparing Kafka-Connect was failed...!"; fi
