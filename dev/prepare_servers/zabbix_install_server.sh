
# Install Zabbix Server on Ubuntu 22.04
# Following the instructions from :
# https://kifarunix.com/install-zabbix-server-on-ubuntu/


apt update


# before from start, let's add some extra swap memory
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
swapon --show
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab


# then let's start the installation

apt install software-properties-common -y
add-apt-repository ppa:ondrej/php --yes &> /dev/null
apt update

# Then the lines end with  \ it means, it is the same line, so run all at once.
apt install build-essential libmariadb-dev sudo libxml2-dev \
php7.4 php7.4-gd php7.4-xml php7.4-bcmath php7.4-mbstring libapache2-mod-php7.4 \
php7.4-ldap php7.4-mysql apache2 mysql-server snmp libsnmp-dev \
libcurl4-openssl-dev libevent-dev libpcre3-dev libxml2-dev \
libmariadb-dev libopenipmi-dev pkg-config libssh2-1-dev libldap-dev



#Create Zabbix Database and Database User
mysql

create database zabbixdb character set utf8 collate utf8_bin;
create user zabbixadmin@localhost identified by 'P@SSw0RD';
grant all on zabbixdb.* to zabbixadmin@localhost;
flush privileges;
quit

# Create Zabbix User System Account
useradd -r -d /var/lib/zabbix -s /sbin/nologin -M zabbix
mkdir -m u=rwx,g=rwx,o= -p /var/lib/zabbix
chown zabbix:zabbix /var/lib/zabbix


# Download Zabbix Source Code
cd ~/
wget https://cdn.zabbix.com/zabbix/sources/stable/6.0/zabbix-6.0.4.tar.gz
tar xzf zabbix-6.0.4.tar.gz

# Configure Zabbix Sources
cd zabbix-6.0.4

./configure --enable-server --enable-agent --with-mysql --enable-ipv6 \
--with-net-snmp --with-libcurl --with-libxml2 --with-ssh2 --with-net-snmp \
--with-ldap

# Compile
make install

# Configuring Zabbix on Ubuntu 22.04
vim /usr/local/etc/zabbix_server.conf

# Edit  the below
...
DBHost=localhost
...
DBName=zabbixdb
...
DBUser=zabbixadmin
...
DBPassword=P@SSw0RD
...

# Change Zabbix Server Log Directory
LogFile=/var/log/zabbix_server.log

# Then save and exit

# Prepare the Log Directory
touch /var/log/zabbix_server.log
chown zabbix:zabbix /var/log/zabbix_server.log


#  Import Zabbix Default Database and Initial Data
cd ~/zabbix-6.0.4/database/mysql/
ls -1 *.sql
# When asked for the password, enter the password for the zabbixadmin user.
# in this sample it is: P@SSw0RD
mysql -u zabbixadmin -p zabbixdb < schema.sql
mysql -u zabbixadmin -p zabbixdb < images.sql
mysql -u zabbixadmin -p zabbixdb < data.sql

# Running Zabbix Server and Agent 

# Create a systemd service for Zabbix server. (run all until the last EOL)
cat > /etc/systemd/system/zabbix-server.service << EOL
[Unit]
Description=Zabbix Server
After=syslog.target network.target mariadb.service
 
[Service]
Type=oneshot
User=zabbix
ExecStart=/usr/local/sbin/zabbix_server
ExecReload=/usr/local/sbin/zabbix_server -R config_cache_reload
RemainAfterExit=yes
PIDFile=/var/run/zabbix/zabbix_server.pid
 
[Install]
WantedBy=multi-user.target
EOL

# Create a systemd service for Zabbix agent (run all until the last EOL)
cat >  /etc/systemd/system/zabbix-agent.service << EOL
[Unit]
Description=Zabbix Agent
After=syslog.target network.target
 
[Service]
Type=oneshot
User=zabbix
ExecStart=/usr/local/sbin/zabbix_agentd
RemainAfterExit=yes
PIDFile=/var/run/zabbix/zabbix_agent.pid
 
[Install]
WantedBy=multi-user.target
EOL

# Reload systemd configuration
systemctl daemon-reload

#Start and enable Zabbix server,agent deamon to run on system start.
systemctl enable --now zabbix-server zabbix-agent

# Installing Zabbix Frontend on Ubuntu 22.04
mkdir /var/www/html/zabbix
cp -a ~/zabbix-6.0.4/ui/* /var/www/html/zabbix/
chown -R www-data:www-data /var/www/html/zabbix/

# Configure Zabbix Frontend
sed -i '/post_max_size/s/= 8M/= 16M/' /etc/php/7.4/apache2/php.ini
sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/7.4/apache2/php.ini
sed -i '/max_input_time/s/= 60/= 300/' /etc/php/7.4/apache2/php.ini
sed -i 's/;date.timezone =/date.timezone = Asia\/Nicosia/' /etc/php/7.4/apache2/php.ini
systemctl restart apache2


# Then access:
http://{squid-a public IP}/zabbix/

# Click [Next step]
# Click [Next step] again
# At dataabase use this data:
# Database Host=localhost
# Database Name=zabbixdb
# User=zabbixadmin
# Password=P@SSw0RD
# Click [Next step] again
# At Zabbix server name, set Zabbix
# At Default time zone, search Asia/Tokyo
# Click [Next step] again
# Click [Next step] again
# Click [Finish]
# Login with the user name "Admin" and password "zabbix"