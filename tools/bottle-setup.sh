#!/bin/bash
set -ueo pipefail

if [ -e bottle.json ]; then
	echo A bot has already been created\! \(bottle.json exists\)
else
	if [ "$#" == 0 ]; then
		echo usage: run this command as
		echo "$0" \'TOKEN\'
		echo \(where TOKEN is your discord bot token\)
		exit 1
	fi
	token="$1"
	cat <<end > bottle.json
{
    "prefix": ".",
    "token": "$token"
}
end
	mkdir -p commands events users
	echo Set up a new Bottle bot
fi

