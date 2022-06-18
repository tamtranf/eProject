


# To set outgoing proxy
export http_proxy=http://10.10.0.10:3128
export https_proxy=http://10.10.0.10:3128


# Install zabbix-agent
apt update
apt -y install zabbix-agent

# Enable zabbix-agent
systemctl status zabbix-agent
systemctl enable zabbix-agent

# Configure
vim /etc/zabbix/zabbix_agentd.conf
Server=10.10.0.10
ListenPort=10050
ServerActive=10.10.0.10
Hostname=ip-10-10-X-X0

# Restart
systemctl restart zabbix-agent
systemctl status zabbix-agent



# Add 10050 to security group to 10.10.0.0/16 at port 10050

# Go to zabbix interface, at Hosts, Click on create host.
# At Host name, set the host name you added on the config.
# At "Visible name" add a name that represent the instance.
# At "Templates" choose "Linux by Zabbix agent" and "Zabbix server health".
# At "Groups" choose "Linux Servers".
# At "Interfaces" click on "Add" and choose "Agent", and add the IP of the instance .
# Then click on [Add].