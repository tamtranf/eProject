#!/bin/bash

# You need to configure your proxy server in your environment
export http_proxy=http://{squid-a IP}:3128
export https_proxy=http://{squid-a IP}:3128


# you can add this file into ~/.bin/set_proxy.sh or  /root/.bin/set_proxy.sh and then can use from any place.