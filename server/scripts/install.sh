#!/bin/bash
# Cloud Computing Server Setup
# Installation script for Ubuntu 12.04 LTS
# @author Muhammad Dadu

export PORJECT_NAME="Clout - Cloud Technology"
export DEFAULT_HOSTNAME="clout"
export DEFAULT_PASSWORD="clout2016"
export isVagrantVMFile="/etc/is_vagrant_vm"
export SERVICES_PATH='/clout/server/node_modules/'

echo "------------------------------------------------"
echo "------------------------------------------------"
echo "	" $PORJECT_NAME "Server Setup"
echo "------------------------------------------------"
echo "------------------------------------------------"
echo ""
echo "Checking server state..."

# load functions
source /clout/server/scripts/functions.sh

echo "NodeJS:  	$(echo_if $(is_installed node))"
echo "Docker:  	$(echo_if $(is_installed docker))"
# echo "Redis:   	$(echo_if $(is_installed redis-server))"
# echo "MySQL:   	$(echo_if $(is_installed mysql))"
# echo "Nginx:  	$(echo_if $(is_installed nginx))"
echo "initd-forever:	$(echo_if $(is_installed initd-forever))"
echo ""

if [ -e "/etc/hasclout" ];
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
apt-get install -y make g++ git curl vim libcairo2-dev libav-tools nfs-common portmap software-properties-common > /dev/null
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
# Docker installation
##
if [ $(is_installed docker) == 1 ];
then
	echo "Skipping Docker installation"
else
	echo "Installing Docker..."
	# Update Kernal
	apt-get install -y linux-image-generic-lts-raring linux-headers-generic-lts-raring > /dev/null
	curl https://get.docker.com/ | sh > /dev/null
	echo "Installed!"
fi

##
# sqlite3 Installation
##
# TODO

# ##
# # Redis Server
# ##
# if [ $(is_installed redis-server) == 1 ];
# then
# 	echo "Skipping Redis installation"
# else
# 	echo "Installing Redis..."
# 	add-apt-repository -y ppa:chris-lea/redis-server > /dev/null
# 	apt-get update > /dev/null
# 	apt-get install -y redis-server > /dev/null
# 	echo "Installed!"
# fi

# ##
# # MySQL Server
# ##
# if [ $(is_installed mysql) == 1 ];
# then
# 	echo "Skipping MySQL installation"
# else
# 	echo "Installing MySQL..."
# 	# Install unattended
# 	sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password '$DEFAULT_PASSWORD''
# 	sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '$DEFAULT_PASSWORD''
# 	apt-get install -y mysql-server > /dev/null
# 	echo "Installed!"
# fi

# ##
# # Nginx
# ##
# if [ $(is_installed nginx) == 1 ];
# then
# 	echo "Skipping Nginx installation"
# else
# 	echo "Installing Nginx..."
# 	# Install unattended
# 	apt-get install -y nginx > /dev/null
# 	echo "Installed!"
# fi
# service nginx restart > /dev/null # restart nginx

##
# initd-forever
##
if [ $(is_installed initd-forever) == 1 ];
then
	echo "Skipping initd-forever installation"
else
	echo "Installing initd-forever..."
	npm install -g initd-forever forever > /dev/null
	echo "Installed!"
fi

##
# clout services
##
SERVICES_PATH='/clout/server/node_modules/'
# auth server
SERVICE_NAME='clout-services-child'
# Link Service
echo "$SERVICE_NAME: Link Service"
initd-forever --app $SERVICES_PATH""$SERVICE_NAME --name $SERVICE_NAME --env development
chmod +x $SERVICE_NAME
mv $SERVICE_NAME /etc/init.d/$SERVICE_NAME
service $SERVICE_NAME start

echo ""
echo "------------------------------------------------"
echo "Server is connected @" $(hostname -I)
echo "------------------------------------------------"

