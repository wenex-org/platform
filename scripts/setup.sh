#!/bin/bash

######################
# Assets Preparation #
######################

# Machine
bash ./scripts/machine.sh
if [ $? == 0 ]; then echo -e "Machine prepared successfully.\n"
else echo -e "Preparing machine assets was failed...!\n" && exit 1; fi

# Proto
bash ./scripts/proto.sh
if [ $? == 0 ]; then echo -e "Proto prepared successfully.\n"
else echo -e "Preparing proto assets was failed...!\n" && exit 1; fi

# Kafka Connect
echo -e "If you want to setup kafka connect needs to run 'npm run script:kafka-connect'\n"
