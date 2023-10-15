#!/bin/bash

######################
# Assets Preparation #
######################

# Proto
sh ./script/proto.sh
if [ $? == 0 ]; then echo "Proto prepared successfully."
else echo "Preparing proto assets was failed...!"; fi
