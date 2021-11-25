#!/bin/bash
set -ueo pipefail

if [[ "$#" -lt 2 ]]; then
	echo usage: "$0" ID COMMAND [args]
	exit 1
fi

uid="$1"
shift 1

BOTTLE_USER_ID="$uid" exec "$@"
