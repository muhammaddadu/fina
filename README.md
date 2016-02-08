# Final Year Project
This project will investigate current technologies for deploying a Cloud Computing System, which will be capable of hosting linux containers. Technology such as Maas, Juju, OpenStack & Docker will be explored with the intention of monitoring it’s performance.

## Background
Cloud computing has come a long way. It has evolved through phases including utility & grid computing, application service provider (ASP), & Software as a Service (SaaS).

In recent years cloud computing has become a requirement in many businesses, to provide multiple clusters on demand. There are many companies providing this service. New systems such as Docker could be used to improve the utilisation of the hardware. The goal is to do more with less.

## Aim
Design & Build a Cloud Computing System capable of hosting Linux containers.

## Objectives
 - Design, deploy cloud computing system
 - Host different virtual machines ancd services
 - Evaluate the performance.

## File Structure
Instead of seperating each component of this system into their own respective repositories, they have been kept in this repositoriy to make it easier to submit.

### /server
This folder contains components, scripts & libraries for the server.
These components are:-
 - Localized Setup
 - Installation Script
 - Authentication Server
 - Services Server (to create Docker containers)
 - Docker Interface Library

### /client
This folder contains client-side tools & libraries such as:- 
 - CLI (Command Line Tools)
 - Services Library

### /shared
This folder contains shared libraries used for client and server such as:-
 - Authentication Library
