#!/bin/bash

move_date=$(date +"%Y%m%d_%H%M%S")

if test `find e-project_*.zip`
then

pm2 stop e-project
pm2 delete e-project

mkdir -p temp_logs
rm temp_logs/*

cp --preserve=timestamps e-project/app/logs/* temp_logs/.

mv e-project old_$move_date

unzip e-project_*.zip
cp  --preserve=timestamps temp_logs/* e-project/app/logs/.

cd e-project/app/

export http_proxy=http://10.10.0.10:3128
export https_proxy=http://10.10.0.10:3128
export no_proxy=localhost,10.10.0.10,169.254.169.254

npm install
export http_proxy=""
export https_proxy=""

pm2 start ecosystem.config.js

cd ../../
mv e-project_*.zip e-project/.

pm2 logs

fi