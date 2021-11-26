#!/usr/bin/env python3
from bottle import user

if 'balance' not in user:
    user.balance = 0
else:
    user.balance = user.balance + 1

print("Your balance is: %s" % user.balance)
