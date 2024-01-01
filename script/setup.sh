#!/bin/bash

######################
# Assets Preparation #
######################

# Proto
sh ./script/proto.sh
if [ $? == 0 ]; then echo -e "Proto prepared successfully.\n\n"
else echo -e "\n\nPreparing proto assets was failed...!" && exit 1; fi
