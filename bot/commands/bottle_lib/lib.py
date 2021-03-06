import sys
import os
from os import path
from os import environ
from .helpers import enumerate_dirs
from .bunchdict import BunchDict
import json

# Used if no current ID was specified, and no bot ID was found.
COMMANDLINE_UID = 'bot'
DEFAULT_UID = 'default'
_home_path = environ.get('BOTTLE_HOME_PATH') or None
_bot_uid = None

def get_home_path():
    # going up the path, find the first directory that has the file bottle.json
    global _home_path
    if _home_path is None:
        for curdir in enumerate_dirs(path.curdir):
            target = path.join(curdir, 'bottle.json')
            if path.exists(target):
                _home_path = curdir
                return curdir
    if not _home_path:
        raise RuntimeError('No home found')
    return _home_path

def get_current_user_id():
    # todo: return the bot's id if available
    return environ.get('BOTTLE_USER_ID') or COMMANDLINE_UID

def get_user_path(uid):
    return path.join(get_home_path(), 'users', "%s.json" % uid)

def open_user_file(uid, mode='r'):
    return open(get_user_path(uid), mode)

def new_user(uid):
    user = {'id': uid}
    if path.exists(get_user_path(DEFAULT_UID)):
        dflt = dict(get_user(DEFAULT_UID))
        dflt.update(user)
        user = dflt
    return BunchDict(user)

def dereference_uid(uid_ref):
    if _bot_uid and uid_ref == _bot_uid:
        return COMMANDLINE_UID
    else:
        return uid_ref

def get_user(uid_ref):
    uid = dereference_uid(uid_ref)
    upath = get_user_path(uid)
    if not path.exists(upath):
        # Construct the user if it doesn't exist
        user = new_user(uid)
        return user
    else:
        # Otherwise, load from existing data
        with open_user_file(uid) as f:
            user_dict = json.load(f)
        if uid != 'default' and path.exists(get_user_path(DEFAULT_UID)):
            with open(get_user_path(DEFAULT_UID)) as f:
                dflt = dict(get_user(DEFAULT_UID))
                dflt.update(user_dict)
                user_dict = dflt
        if uid_ref == COMMANDLINE_UID:
            global _bot_uid
            _bot_uid = user_dict['id']
        return BunchDict(user_dict)

def save_user(user):
    # Save the user's data as well-formatted json
    user_dict = dict(user)
    if 'self' in user:
        oldpath = get_user_path(COMMANDLINE_UID)
    else:
        oldpath = get_user_path(user.id)
    newpath = path.join(
        path.dirname(oldpath), '.__bottle_new__' + path.basename(oldpath) + '.new'
    )
    with open(newpath, 'w') as f:
        json.dump(user_dict, f, indent=4, sort_keys=True)
        f.write('\n')
    if os.path.exists(oldpath):
        os.remove(oldpath)
    os.rename(newpath, oldpath)
    return True

def get_current_user():
    uid = get_current_user_id()
    user = get_user(get_current_user_id())
    if 'tag' not in user:
        if uid == COMMANDLINE_UID:
            raise RuntimeError('bot user has no tag set! (was the bot user initialized?)')
        elif 'BOTTLE_USER_TAG' not in os.environ:
            raise RuntimeError('BOTTLE_USER_TAG undefined')
        else:
            user.tag = os.environ['BOTTLE_USER_TAG']
    if 'name' not in user:
        user.name = user.tag[0:user.tag.index('#')]
    return user

