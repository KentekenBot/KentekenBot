#!/bin/sh

aws s3 cp kentekenbot.db s3://kentekenbot-backups/$(date +"%Y-%m-%d_%H%M%S")_kentekenbot.db --profile=kentekenbot\
