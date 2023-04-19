#!/bin/sh
git reset --hard
git pull
docker stop ssa_front
docker rm ssa_front
docker build --tag sales-automation-fe .
docker run --restart unless-stopped -p 3000:3000 -d --name ssa_front sales-automation-fe
