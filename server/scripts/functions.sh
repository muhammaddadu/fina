#!/bin/bash
##
# A collection of functions & stuff
#
# Define a few Color's
GREEN='\e[32m'
RED='\e[31m'
NC='\033[0m'              # No Color

# return 1 if global command line program installed, else 0
function is_installed {
  # set to 1 initially
  local result_=1
  # set to 0 if not found
  type $1 >/dev/null 2>&1 || { local result_=0; }
  # return value
  echo "$result_"
}

# display a message in red with a cross by it
function echo_fail {
  # echo first argument in red then clear
  printf "${RED}✘ ${1} ${NC}"
}

# display a message in green with a tick by it
function echo_pass {
  # echo first argument in green then clear
  printf "${GREEN}✔ ${1} ${NC}"
}

# echo pass or fail
function echo_if {
  if [ $1 == 1 ]; then
    echo_pass $2
  else
    echo_fail $2
  fi
}