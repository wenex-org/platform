#!/bin/bash

######################
# Assets Preparation #
######################

# Machine
bash ./scripts/machine.sh
if [ $? == 0 ]; then echo "Machine prepared successfully."
else echo "Preparing machine assets was failed...!"; fi
