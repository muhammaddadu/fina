# Local Development

## Install Vagrant & VirtualBox
 - [Vagrant 1.5](http://vagrantup.com)
 - [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Setup
In this directory, run the following commands
```
vagrant up
vagrant ssh
```

## Notes
To create this Vagrantfile, the following commands were run;
```
vagrant box add JujuBox https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-juju-vagrant-disk1.box
vagrant init JujuBox
```
