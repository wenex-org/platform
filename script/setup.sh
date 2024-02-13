#!/bin/bash

######################
# Assets Preparation #
######################

# Proto
bash ./script/proto.sh
if [ $? == 0 ]; then echo -e "Proto prepared successfully.\n\n"
else echo -e "\n\nPreparing proto assets was failed...!" && exit 1; fi

# Kafka Connect
echo -e "\nIf you want to setup kafka connect needs to run 'npm run script:kafka-connect'\n"
