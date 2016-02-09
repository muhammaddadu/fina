#!/bin/bash
# Cloud Computing Server Setup
# Installation script for Ubuntu 12.04 LTS
# @author Muhammad Dadu

export PORJECT_NAME="Final Year Project"
export DEFAULT_HOSTNAME="fyp"
export DEFAULT_PASSWORD="fyp2016"
export isVagrantVMFile="/etc/is_vagrant_vm"

echo "------------------------------------------------"
echo "------------------------------------------------"
echo "	" $PORJECT_NAME "Server Setup"
echo "------------------------------------------------"
echo "------------------------------------------------"
echo ""
echo "Checking server state..."

# load functions
source /fyp/server/scripts/functions.sh

echo "NodeJS:	$(echo_if $(is_installed node))"
echo "Redis:	$(echo_if $(is_installed redis-server))"
echo "MySQL:	$(echo_if $(is_installed mysql))"
echo ""

if [ -e "/etc/hasFyp" ];
then
    echo $PORJECT_NAME "provisioning already completed. Skipping..."
    exit 0
else
    echo "Installation Starting..."
fi

if [ -e $isVagrantVMFile ];
then
	echo "Unattended Installation Trigerred"
	echo "Is Inside Vagrant"
fi

##
# Update hostname
##
if [ -e $isVagrantVMFile ];
then
	export HOSTNAME=$DEFAULT_HOSTNAME
	export DEBIAN_FRONTEND=noninteractive
else
	# request input from stdin
	echo "Please enter hostname, followed by [ENTER]:"
	read HOSTNAME
fi
# update file
echo $HOSTNAME > /etc/hostname
# prevent "Unable to resolve hostname" issue
echo "127.0.0.1" $HOSTNAME >> /etc/hosts
# set hostname without restart
hostname $HOSTNAME
echo "------------------------------------------------"
echo " Hostname:" $HOSTNAME
echo "------------------------------------------------"

##
# Core Componenets
##
echo "Updating/Installing Core Componenets..."
apt-get update > /dev/null
# Install build tools
apt-get install -y make g++ git curl vim libcairo2-dev libav-tools nfs-common portmap > /dev/null
echo "Updated/Installed!"

##
# NodeJS installation
##
if [ $(is_installed node) == 1 ];
then
	echo "Skipping NodeJS installation"
else
	echo "Installing NodeJS..."
	# Modified from https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
	apt-get install -y python-software-properties python g++ make > /dev/null
	add-apt-repository -y ppa:chris-lea/node.js > /dev/null
	apt-get update > /dev/null
	apt-get install -y nodejs > /dev/null
	npm install n -g > /dev/null # node package manager
	n 0.12 > /dev/null # install node 0.12
	echo "Installed!"
fi

##
# Redis Server
##
if [ $(is_installed redis-server) == 1 ];
then
	echo "Skipping Redis installation"
else
	echo "Installing Redis..."
	add-apt-repository -y ppa:chris-lea/redis-server > /dev/null
	apt-get update > /dev/null
	apt-get install -y redis-server > /dev/null
	echo "Installed!"
fi

##
# MySQL Server
##
if [ $(is_installed mysql) == 1 ];
then
	echo "Skipping MySQL installation"
else
	echo "Installing MySQL..."
	# Install unattended
	if [ -e $isVagrantVMFile ];
	then
		sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password '$DEFAULT_PASSWORD''
		sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '$DEFAULT_PASSWORD''
	fi;
	sudo apt-get install -y mysql-server > /dev/null
	echo "Installed!"
fi

