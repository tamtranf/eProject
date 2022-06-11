# run the below as root
sudo su

# run this to change the timezone to Tokyo
timedatectl set-timezone Asia/Tokyo

# add it to .bashrc to configure the history command with the time
# you can do this as sudo, and at ubuntu user too.
vim ~/.bashrc
HISTSIZE=10000
HISTFILESIZE=20000:
HISTTIMEFORMAT="%Y/%m/%d %T "


apt update
apt install -y mlocate tree unzip net-tools zip 
