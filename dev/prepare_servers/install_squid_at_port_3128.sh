# Below are the instructions to install the Squid proxy application.
# Based on the site https://www.server-world.info/en/note?os=Ubuntu_22.04&p=squid&f=1 instructions
# This is valid for Ubuntu 22.04. Different OS versions, may require different instructions.

sudo su
apt update
apt install squid

# Check the status
systemctl status squid

# make a backup of the confg file.
cp /etc/squid/squid.conf{,.orginal}

# Edit the config file
vim /etc/squid/squid.conf


# line 1341 : add (define ACL for internal network)
.....
.....
acl localnet src 172.16.0.0/12          # RFC 1918 local private network (LAN)
acl localnet src 192.168.0.0/16         # RFC 1918 local private network (LAN)
acl localnet src fc00::/7               # RFC 4193 local private network range
acl localnet src fe80::/10              # RFC 4291 link-local (directly plugged)) machines
acl my_localnet src 10.0.0.0/16 

# line 1541 : uncomment
http_access deny to_localhost

# line 1552 : comment out and add the line (apply ACL for internal network)
#http_access allow localnet
#http_access allow localhost
http_access allow my_localnet

# line 5921 : add
request_header_access Referer deny all
request_header_access X-Forwarded-For deny all
request_header_access Via deny all
request_header_access Cache-Control deny all

# line 8649 : add
# forwarded_for on
forwarded_for off


# then save.

# restart the squid service
systemctl restart squid
systemctl status squid


# Then to access the internet from the other servers, use the below command
export http_proxy=http://{Squid IP}:3128
export https_proxy=http://{Squid IP}:3128

# For example:
export http_proxy=http://10.0.0.10:3128
export https_proxy=http://10.0.0.10:3128

#Also don't forget to open the port 3128 in the AWS Security groups on the server where .
