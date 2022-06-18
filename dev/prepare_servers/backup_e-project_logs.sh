#!/bin/bash

base_path=/usr/local/iss/e-project/e-project/app/logs/
files_path=$base_path/e_app*.log.*
old_files_path=$base_path/e_app*.log
temp_path=/var/log/e-project/app/$(date +"%Y")
s3_path=backups/app/logs
bucket_name=e-project-files-0605


mkdir -p $temp_path
for file_path in $files_path; do
        if test `find $file_path -amin +1 -mmin +120 -size +0c`
         then
                file_name=$(basename -- "$file_path")
                file_time=$(date -r $file_path "+%Y%m%d_%H%M%S")
                new_file_name=$file_time"_"$file_name
                new_file_path=$temp_path/$new_file_name
                echo "     New file name: $new_file_name  as $new_file_path"
                mv $file_path $new_file_path

                aws s3 cp --storage-class STANDARD_IA  $new_file_path s3://$bucket_name/$s3_path/$new_file_name.json

        else
                echo "IGNORE "$file_path
        fi
done

for file_path in $old_files_path; do
        if test `find $file_path -amin +1 -mmin +360 -size +0c`
         then
                file_name=$(basename -- "$file_path")
                file_time=$(date -r $file_path "+%Y%m%d_%H%M%S")
                new_file_name=$file_time"_"$file_name
                new_file_path=$temp_path/$new_file_name
                echo "     New file name: $new_file_name  as $new_file_path"
                mv $file_path $new_file_path

                aws s3 cp --storage-class STANDARD_IA  $new_file_path s3://$bucket_name/$s3_path/$new_file_name.json

        else
                echo "IGNORE "$file_path
        fi
done
find $base_path -amin +1 -mmin +360 -size 0c -exec rm -rf {} \;
find /var/log/e-project/app/ -amin +129600 -exec rm -rf {} \;
