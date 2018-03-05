#!/bin/bash
cd $1
touch /tmp/${2}_dep
echo "Début de l'installation"

echo 0 > /tmp/${2}_dep

wget https://raw.githubusercontent.com/lunarok/jeedom_nodejs/master/nodejs.sh -O dependencies.sh
sh dependencies.sh ${1} ${2}
rm dependencies.sh

rm /tmp/${2}_dep

echo "Fin de l'installation"
