#!/bin/bash
# Cloud Computing Server Setup
# Installation script for Ubuntu 12.04 LTS
# @author Muhammad Dadu

export PORJECT_NAME="Final Year Project"
export DEFAULT_HOSTNAME="fyp"
export DEFAULT_PASSWORD="fyp2016"
export isVagrantVMFile="/etc/is_vagrant_vm"
export SERVICES_PATH='/fyp/server/node_modules/'

echo "------------------------------------------------"
echo "------------------------------------------------"
echo "	" $PORJECT_NAME "Server Setup"
echo "------------------------------------------------"
echo "------------------------------------------------"
echo ""
echo "Checking server state..."

# load functions
source /fyp/server/scripts/functions.sh

echo "NodeJS:  	$(echo_if $(is_installed node))"
echo "Docker:  	$(echo_if $(is_installed docker))"
echo "Redis:   	$(echo_if $(is_installed redis-server))"
echo "MySQL:   	$(echo_if $(is_installed mysql))"
echo "Nginx:  	$(echo_if $(is_installed nginx))"
echo "Nodemon:	$(echo_if $(is_installed nodemon))"
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
	sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password '$DEFAULT_PASSWORD''
	sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '$DEFAULT_PASSWORD''
	apt-get install -y mysql-server > /dev/null
	echo "Installed!"
fi

##
# Nginx
##
if [ $(is_installed nginx) == 1 ];
then
	echo "Skipping Nginx installation"
else
	echo "Installing Nginx..."
	# Install unattended
	apt-get install -y nginx > /dev/null
	echo "Installed!"
fi
service nginx restart > /dev/null # restart nginx

##
# Nodemon
##
if [ $(is_installed nodemon) == 1 ];
then
	echo "Skipping Nodemon installation"
else
	echo "Installing Nodemon..."
	npm install nodemon -g > /dev/null
	echo "Installed!"
fi

# symlink services manager
# if [ $(is_installed servicesManager) == 1 ];
# then
# 	echo "Skipping Service Manager installation"
# else
# 	echo "Installing Service Manager..."
# 	cd $SERVICES_PATH
# 	cd service-manager
# 	npm install > /dev/null
# 	npm link > /dev/null
# 	echo "Installed!"
# fi
# setup auth server
# servicesManager load --dir $SERVICES_PATH/clout-auth-server --local
# setup services server
# servicesManager load --dir $SERVICES_PATH/services-server --local

##
# FYP services
##
# SERVICES_PATH='/fyp/server/node_modules/'
# # auth server
# SERVICE_NAME='clout-auth-server'
# # Link Service
# echo "$SERVICE_NAME: Link Service"
# FILE=$SERVICES_PATH""$SERVICE_NAME"/server-pack/"$SERVICE_NAME
# if [ -e "/etc/init.d/"$SERVICE_NAME"" ]; then
# 	rm -rf /etc/init.d/$SERVICE_NAME
# fi
# chmod +x $FILE;
# ln -s $FILE /etc/init.d/$SERVICE_NAME
# # add to startup
# update-rc.d $SERVICE_NAME defaults;
# # Start Service
# echo "$SERVICE_NAME: Start Service"
# exec service $SERVICE_NAME start;

echo ""
echo "------------------------------------------------"
echo "Server is connected @" $(hostname -I)
echo "------------------------------------------------"

