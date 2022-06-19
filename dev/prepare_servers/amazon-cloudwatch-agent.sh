
# before from start, need to do this steps;
# Edit the IAM  role e-project-server-role and add CloudWatchAgentServerPolicy
# And create this inline policywith name CloudWatchEProject:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams",
        "logs:PutRetentionPolicy"
    ],
      "Resource": [
        "arn:aws:logs:*:*:*"
    ]
  }
 ]
}

# Then install the agent


mkdir /tmp/aws_temp
cd /tmp/aws_temp
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb


#exit  from sudo and enter again to force to disconnect from internet


#Configure the profile:
aws configure --profile AmazonCloudWatchAgent

# AWS Access Key ID [None]:
# AWS Secret Access Key [None]:
# Default region name [None]: ap-northeast-1
# Default output format [None]:

cat ~/.aws/config

# Edit proxy at:  (Don't need to do it at ths squi-a instance)
vim /opt/aws/amazon-cloudwatch-agent/etc/common-config.toml
[proxy]
    http_proxy = "http://10.10.0.10:3128"
    https_proxy = "http://10.10.0.10:3128"
    no_proxy = "localhost,10.10.0.10,169.254.169.254"


/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
# On which OS are you planning to use the agent?
# 1. linux
# Are you using EC2 or On-Premises hosts?
# 1. EC2
# Which user are you planning to run the agent?
# 1. root
# Do you want to turn on StatsD daemon?
# 2. no
# Do you want to monitor metrics from CollectD? WARNING: CollectD must be installed or the Agent will fail to start
# 2. no
# Do you want to monitor any host metrics? e.g. CPU, memory, etc.
# 1. yes
# Do you want to monitor cpu metrics per core?
# 1. yes
# Do you want to add ec2 dimensions (ImageId, InstanceId, InstanceType, AutoScalingGroupName) into all of your metrics if the info is available?
# 1. yes
# Do you want to aggregate ec2 dimensions (InstanceId)?
# 1. yes
# Would you like to collect your metrics at high resolution (sub-minute resolution)? This enables sub-minute resolution for all metrics, but you can customize for specific metrics in the output json file.
# 4. 60s
# Which default metrics config do you want?
# 1. Basic
# Are you satisfied with the above config? Note: it can be manually customized after the wizard completes to add additional items.
# 1. yes
# Do you have any existing CloudWatch Log Agent (http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AgentReference.html) configuration file to import for migration?
# 2. no

# #### Do this only for reverse-proxies and app-a
# Do you want to monitor any log files?
# 1. yes
# Log file path:
# /var/log/nginx/reverse-access.log
# Log group name:
# default choice: [reverse-access.log]
# Log stream name:
# default choice: [{instance_id}]
# Log Group Retention in days
# 5. 7
# Do you want to specify any additional log files to monitor?
# 1. yes
# /var/log/nginx/reverse-error.log
# Log group name:
# default choice: [reverse-access.log]
# Log stream name:
# default choice: [{instance_id}]
# Log Group Retention in days
# 5. 7
# Do you want to specify any additional log files to monitor?
# 2. no
# Do you want to store the config in the SSM parameter store?
# 2. no

 cat /opt/aws/amazon-cloudwatch-agent/bin/config.json



 # Reload the agent

 /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
tail -n 20 -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

