#!/bin/bash
source ~/.bash_profile
source ~/.bashrc

cd /var/api

source scripts/deployment/import-params.sh -p /API/ENV/PRODUCTION/ -r eu-central-1

pm2 stop all

pm2 start server/index.js --update-env
