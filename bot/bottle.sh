#!/bin/sh
zero="$(readlink -f -- "$0")"
exec node --unhandled-rejections=warn "$(dirname "$zero")"/../index.js "$@"
