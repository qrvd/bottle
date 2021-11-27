#!/usr/bin/env python3
from bottle import user

def fence(s):
    print('```')
    print(s, end='')
    print('```')

fence(user)
