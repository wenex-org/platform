#!/bin/bash

######################
# Assets Preparation #
######################

# Protos
sh ./script/proto.sh
if [ $? == 0 ]; then echo "Protos prepared successfully."
else echo "Preparing proto assets was failed...!"; fi
