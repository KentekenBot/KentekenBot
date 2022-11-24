#!/bin/sh

cd src/database/migrations
cp template.ts "`date +"%Y%m%d%H%M%S"`-$1.ts"
